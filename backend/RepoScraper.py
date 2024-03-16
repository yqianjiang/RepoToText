import os
from datetime import datetime
import re
from github import Github, RateLimitExceededException
from bs4 import BeautifulSoup
import requests
from requests.exceptions import RequestException
from retry import retry

# pylint: disable=line-too-long
# pylint: disable=C0103


class BaseScraper:
    def __init__(self, doc_link=None, selected_file_types=None):
        if selected_file_types is None:
            selected_file_types = []
        self.selected_file_types = selected_file_types
        self.doc_link = doc_link

    def fetch_all_files(self):
        raise NotImplementedError

    def scrape_doc(self):
        """Scrape webpage."""
        if not self.doc_link:
            return ""
        try:
            page = requests.get(self.doc_link, timeout=10)
            soup = BeautifulSoup(page.content, 'html.parser')
            return soup.get_text(separator="\n")
        except RequestException as e:
            print(f"Error fetching documentation: {e}")
            return ""

    def write_to_file(self, files_data, output_filename):
        """Built .txt file with all of the repo's files"""
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        filename = f"{output_filename}_{timestamp}.txt"
        with open(filename, "w", encoding='utf-8') as f:
            doc_text = self.scrape_doc()
            if doc_text:
                f.write(f"Documentation Link: {self.doc_link}\n\n")
                f.write(f"{doc_text}\n\n")
            f.write(f"*Files*\n")
            for file_data in files_data:
                f.write(file_data)
        return filename

    def clean_up_text(self, filename):
        with open(filename, 'r', encoding='utf-8') as f:
            text = f.read()
        cleaned_text = re.sub('\n{3,}', '\n\n', text)
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(cleaned_text)

    def get_files_content(self):
        """获取所有文件的内容"""
        files_data = self.fetch_all_files()

        content = ""
        doc_text = self.scrape_doc()
        if doc_text:
            content += f"Documentation Link: {self.doc_link}\n\n"
            content += f"{doc_text}\n\n"
        content += f"*Files*\n"
        content += "\n".join(files_data)
        cleaned_text = re.sub('\n{3,}', '\n\n', content)

        return cleaned_text

    def run(self, output_filename):
        print("Fetching all files...")
        files_data = self.fetch_all_files()

        print("Writing to file...")
        filename = self.write_to_file(files_data, output_filename)

        print("Cleaning up file...")
        self.clean_up_text(filename)

        print("Done.")
        return filename


class GithubRepoScraper(BaseScraper):
    """Scrape GitHub repositories."""

    def __init__(self, repo_name, doc_link=None, selected_file_types=None):
        super().__init__(doc_link, selected_file_types)
        self.github_api_key = os.getenv("GITHUB_API_KEY")
        self.repo_name = repo_name

    @retry(RateLimitExceededException, tries=5, delay=2, backoff=2)
    def fetch_all_files(self):
        """Fetch all files from the GitHub repository."""
        def recursive_fetch_files(repo, contents):
            files_data = []
            for content_file in contents:
                if content_file.type == "dir":
                    files_data += recursive_fetch_files(
                        repo, repo.get_contents(content_file.path))
                else:
                    # Check if file type is in selected file types
                    if any(content_file.name.endswith(file_type) for file_type in self.selected_file_types):
                        file_content = ""
                        file_content += f"\n'''--- {content_file.path} ---\n"

                        if content_file.encoding == "base64":
                            try:
                                file_content += content_file.decoded_content.decode(
                                    "utf-8")
                            except UnicodeDecodeError:  # catch decoding errors
                                file_content += "[Content not decodable]"
                        elif content_file.encoding == "none":
                            # Handle files with encoding "none" here
                            print(
                                f"Warning: Skipping {content_file.path} due to unsupported encoding 'none'.")
                            continue
                        else:
                            # Handle other unexpected encodings here
                            print(
                                f"Warning: Skipping {content_file.path} due to unexpected encoding '{content_file.encoding}'.")
                            continue

                        file_content += "\n'''"
                        files_data.append(file_content)
            return files_data

        github_instance = Github(self.github_api_key)
        repo = github_instance.get_repo(self.repo_name)
        contents = repo.get_contents("")
        files_data = recursive_fetch_files(repo, contents)
        return files_data

    def run(self):
        """Run RepoToText."""
        filename = f"/app/data/{self.repo_name.replace('/', '_')}"
        return super().run(filename)


class LocalRepoScraper(BaseScraper):
    def __init__(self, repo_paths, doc_link=None, selected_file_types=[]):
        super().__init__(selected_file_types=selected_file_types, doc_link=doc_link)
        self.repo_paths = repo_paths

    def fetch_all_files(self):
        files_data = []
        for file_path in self.repo_paths:
            # Check if file type is in selected file types
            if any(file_path.endswith(file_type) for file_type in self.selected_file_types):
                relative_path = os.path.basename(file_path)
                file_content = ""
                file_content += f"\n'''--- {relative_path} ---\n"
                try:
                    with open(file_path, 'rb') as f:  # Open file in binary mode
                        content = f.read()
                    try:
                        # Try decoding as UTF-8
                        content_decoded = content.decode('utf-8')
                    except UnicodeDecodeError:
                        # If decoding fails, replace non-decodable parts
                        content_decoded = content.decode(
                            'utf-8', errors='replace')
                    file_content += content_decoded
                except Exception as e:  # catch any reading errors
                    print(f"Error reading file {file_path}: {e}")
                    continue
                file_content += "\n'''"
                files_data.append(file_content)
                # Print file size
                print(
                    f"Processed file {file_path}: size {os.path.getsize(file_path)} bytes")
            else:
                print(
                    f"Skipping file {file_path}: Does not match selected types.")
        return files_data

    def run(self):
        filename = f"/app/data/repo"
        return super().run(filename)
