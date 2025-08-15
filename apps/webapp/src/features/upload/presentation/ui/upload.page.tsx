import { MainLayout } from "#shared/ui/layouts/main.layout.tsx";
import { PropsWithChildren } from "@kitajs/html";

type UploadPageProps = {
  html: (value: JSX.Element) => Promise<Response | string> | Response | string;
}


export const UploadPage = (props: PropsWithChildren<UploadPageProps>) => {
  const { html } = props;
  return html(
    <MainLayout
      head={`<script src="upload/js/upload.page.js" defer />`}
      title="Upload your files"
    >
      <h1>Upload</h1>
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
