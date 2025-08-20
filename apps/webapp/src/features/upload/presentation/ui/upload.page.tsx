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
        <div class="row">
          <div class="col-xs-12 col-md-12">
            <p>1. Execute the commands below to generate a git log file.</p>
            <pre class="terminal">
              <span class="user">user@laptop</span>&nbsp;<span class="path">~</span>
              <br/>
              <span class="path">&rarr;&nbsp;</span><span class="output">cd path/to/your/repo</span>
              <br/>
              <br/>
              <span class="user">user@laptop</span>&nbsp;<span class="path">~/path/to/your/repo</span>
              <br/>
              <span class="path">&rarr;&nbsp;</span>
                <span class="output">
                  git log --all --numstat --date=short --pretty=format:'--%h--%ad--%aN' --no-renames --after=YYYY-MM-DD
                  &gt; logfile.log
                </span>
            </pre>
            <p>2. Upload the git log file.</p>
          </div>
        </div>
        <div class="row">
          <div class="col-xs-12 center-xs">
            <form id="form"
              hx-post="/upload"
              hx-encoding="multipart/form-data"
              hx-target="#upload-response"
              hx-swap="afterend"
            >
              <div aria-label="Upload a git log file" class="drop-area">
                <img src="upload/img/anim-file.svg" alt="animated file" />
                <span>Drop your git log file here or click to browse.</span>
                <input id="file" type="file" name="file" />
              </div>
              <button>Upload</button>
            </form>
            <div id="upload-response"></div>
          </div>
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
