import { Html } from "@elysiajs/html";
import { MainLayout } from "#shared/ui/layouts/main.layout.tsx";

export const UploadPage = ({ html}) => {
  return html(
    <MainLayout
      head={<link rel="stylesheet" href="https://cdn.tailwindcss.com" />}
      title="Upload your files"
    >
      <h1>Upload</h1>
      <form action="/upload" method="post" enctype="multipart/form-data">
        <label htmlFor="file" name="file">Upload a git log file</label>
        <input type="file" name="file" />
        <button type="submit">Upload</button>
      </form>
    </MainLayout>
  );
};
