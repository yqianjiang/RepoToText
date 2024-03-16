from pydantic import BaseModel
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import os

from RepoScraper import GithubRepoScraper, LocalRepoScraper
from GitCloneToTxt import scrape_github_repo_by_clone

import tempfile

app = FastAPI()

# 配置 CORS
origins = [
    "http://localhost:4137",  # 替换为你的 React 应用的地址
    # 如果需要,可以添加其他允许的来源
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/scrape_github")
async def scrape_github(repo_name: str, doc_link: str = None, selected_file_types: List[str] = []):
    scraper = GithubRepoScraper(repo_name, doc_link, selected_file_types)
    content = scraper.get_files_content()
    return {"content": content}


@app.post("/scrape_local")
async def scrape_local(files: List[UploadFile] = File(...), selected_file_types: List[str] = [], output_filename: str = "local_files"):
    selected_file_types_list = [
        ext.strip() for ext in selected_file_types[0].split(",") if ext.strip()]

    with tempfile.TemporaryDirectory() as temp_dir:
        file_paths = []
        for file in files:
            file_path = os.path.join(temp_dir, file.filename)
            with open(file_path, "wb") as buffer:
                content = await file.read()
                buffer.write(content)
            file_paths.append(file_path)

        scraper = LocalRepoScraper(
            file_paths, "./outputs", output_filename, selected_file_types=selected_file_types_list)
        content = scraper.get_files_content()
        return {"content": content}


class CloneRequestBody(BaseModel):
    repoUrl: str
    docUrl: str = None
    selectedFileTypes: List[str] = []


@app.post("/scrape_github_by_clone")
async def scrape_github_by_clone(body: CloneRequestBody):
    repo_url = body.repoUrl
    doc_link = body.docUrl
    selected_file_types = body.selectedFileTypes

    content = scrape_github_repo_by_clone(
        repo_url, selected_file_types, doc_link)
    return {"content": content}
