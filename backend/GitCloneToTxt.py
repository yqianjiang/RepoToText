from RepoScraper import LocalRepoScraper
import shutil
import os


def build_directory_tree(file_paths):
    tree = ''
    folders = set()
    for file_path in file_paths:
        relative_path = file_path[len("/app/temp/"):]
        path_parts = relative_path.split(os.sep)
        current_folder = ''
        for i, part in enumerate(path_parts[:-1]):
            current_folder = os.path.join(current_folder, part)
            if current_folder not in folders:
                if i == 0:
                    tree += f'{part}/\n'
                else:
                    tree += '|  ' * (i - 1) + '|--' + f'{part}/\n'
                folders.add(current_folder)
        tree += '|  ' * (len(path_parts) - 1) + f'{path_parts[-1]}\n'
    return tree


def git_clone_repo(repo_path, temp_dir):
    os.makedirs(temp_dir, exist_ok=True)
    os.system(f"git clone {repo_path} {temp_dir}")
    return os.path.join(os.getcwd(), temp_dir)


def is_valid_file(file_path, selected_file_types):
    ignore_files = ['favicon.ico', 'package-lock.json',
                    'yarn.lock', 'pnpm-lock.yaml']
    if os.path.basename(file_path) in ignore_files:
        return False
    if file_path.endswith('.png'):
        return False
    if selected_file_types and not any(file_path.endswith(ext) for ext in selected_file_types):
        return False
    return True


def scrape_github_repo_by_clone(repo_path, selected_file_types, doc_link=None):
    if "github.com/" in repo_path:
        temp_dir = "temp"
        repo_dir = git_clone_repo(repo_path, temp_dir)
    else:
        repo_dir = repo_path

    file_paths = []
    for root, _, files in os.walk(repo_dir):
        if '.git' in root:
            continue
        for file in files:
            file_path = os.path.join(root, file)
            if is_valid_file(file_path, selected_file_types):
                file_paths.append(file_path)

    scraper = LocalRepoScraper(
        file_paths, doc_link, selected_file_types)
    content = scraper.get_files_content()

    # 移除临时clone下来的仓库
    if "github.com/" in repo_path:
        shutil.rmtree(temp_dir)

    # 构建目录树并拼接到 content 前面
    directory_tree = build_directory_tree(file_paths)
    return directory_tree + "\n" + content
