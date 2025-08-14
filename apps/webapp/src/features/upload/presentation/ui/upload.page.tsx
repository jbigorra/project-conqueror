import { MainLayout } from "#shared/ui/layouts/main.layout.tsx";

// @ts-ignore
export const UploadPage = ({ html }) => {
  return html(
    <MainLayout
      head=""
      title="Upload your files"
    >
      <h1>Upload</h1>
      <form id="form"
        hx-post="/upload"
        hx-encoding="multipart/form-data"
        hx-target="#upload-response"
        hx-swap="afterend"
      >
        <label htmlFor="file" name="file">Upload a git log file</label>
        <input type="file" name="file" />
        <button>Upload</button>
      </form>
      <div id="upload-response"></div>
    </MainLayout>
  );
};


// @ts-ignore
export const ConfirmationMessage = ({ html }) => {
  return html(
    <>
      <strong class="font-bold">Success!</strong><br />
      <span class="block sm:inline">File uploaded successfully</span>
    </>
  );
};
