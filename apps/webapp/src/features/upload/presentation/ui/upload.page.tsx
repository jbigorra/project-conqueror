import { Layout } from "#shared/ui/layouts/layout.tsx";
import { PropsWithChildren } from "@kitajs/html";

export function UploadPage(props: PropsWithChildren) {
  return (
    <Layout
      head={`
        <script src="/upload/js/upload.page.js" defer></script>
        <link rel="stylesheet" href="/upload/css/upload.css">
      `}
      title="Upload your files"
    >
      <div class="box">
        <div class="row">
          <div class="col-xs-12 col-md-12">
            <pre>
              cd path/to/your/repo <br/><br/>
              git log --all --numstat --date=short --pretty=format:'--%h--%ad--%aN' --no-renames --after=YYYY-MM-DD
                &gt; logfile.log
            </pre>
          </div>
        </div>
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
      </div>
    </Layout>
  )
};

export function ConfirmationMessage() {
  return (
    <>
      <strong class="font-bold">Success!</strong><br />
      <span class="block sm:inline">File uploaded successfully</span>
    </>
  )
};
