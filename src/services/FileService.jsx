const uploadFile = (file, url) => {
    return fetch(url, {
        method: "PUT",
        body: file,
    });
}

const FileService = {
    uploadFile,
};

export default FileService;
