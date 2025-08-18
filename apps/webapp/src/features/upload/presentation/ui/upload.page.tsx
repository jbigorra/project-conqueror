import { MainLayout } from "#shared/ui/layouts/main.layout.tsx";
import { PropsWithChildren } from "@kitajs/html";

export const UploadPage = (props: PropsWithChildren) => {
  return (
    <MainLayout
      head={`<script src="/upload/js/upload.page.js" defer></script>`}
      title="Upload your files"
    >
      <h1>Upload your files</h1>
      <form id="form"
        hx-post="/upload"
        hx-encoding="multipart/form-data"
        hx-target="#upload-response"
        hx-swap="afterend"
      >
        <label for="file">Upload a git log file</label>
        <input id="file" type="file" name="file" />
        <button>Upload</button>
      </form>
      <progress id='progress' value='0' max='100'></progress>
      <div id="upload-response"></div>
    </MainLayout>
  )
};

export const ConfirmationMessage = () => {
  return (
    <>
      <strong class="font-bold">Success!</strong><br />
      <span class="block sm:inline">File uploaded successfully</span>
    </>
  )
};
