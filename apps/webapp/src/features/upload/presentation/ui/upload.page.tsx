import type { PropsWithChildren } from "@kitajs/html";
import { Layout } from "#shared/ui/layouts/layout.tsx";

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
            <br />
            <span class="path">&rarr;&nbsp;</span>
            <span class="output">cd path/to/your/repo</span>
            <br />
            <br />
            <span class="user">user@laptop</span>&nbsp;<span class="path">~/path/to/your/repo</span>
            <br />
            <span class="path">&rarr;&nbsp;</span>
            <span class="output">
              git log --all --numstat --date=short --pretty=format:'--%h--%ad--%aN' --no-renames
              --after=YYYY-MM-DD &gt; logfile.log
            </span>
          </pre>
          <p>2. Upload the git log file.</p>
        </div>
      </div>
      <div class="row">
        <div class="col-xs-12 center-xs">{props.children}</div>
      </div>
    </Layout>
  );
}

export type UploadFormSubmitErrors = {
  file?: {
    error: string;
  };
};

export type UploadFormValues = {
  file?: string;
};

export function UploadForm(
  props: PropsWithChildren<{ values: UploadFormValues; errors: UploadFormSubmitErrors }>,
) {
  const { values = {}, errors = {}, children } = props;
  return (
    <form
      id="form"
      class="row"
      hx-post="/upload"
      hx-encoding="multipart/form-data"
      hx-swap="outerHTML"
    >
      <div aria-label="Upload a git log file" class="drop-area col-xs-12">
        <img src="upload/img/anim-file.svg" alt="animated file" />
        <span>Drop your git log file here or click to browse.</span>
        <input hx-preserve id="file" type="file" name="file" value={values.file} />
      </div>
      {errors.file && (
        <div class="col-xs-12">
          <p>
            <small>
              <code>{errors.file.error}</code>
            </small>
          </p>
        </div>
      )}
      <div class="col-xs-12">
        <button class="upload-btn">Upload</button>
      </div>
      <div class="col-xs-12 center-xs">{children}</div>
    </form>
  );
}

export function UploadFormWithErrors(
  props: Readonly<{ values: UploadFormValues; errors: UploadFormSubmitErrors }>,
) {
  const { values, errors } = props;
  return <UploadForm values={values} errors={errors} />;
}

export function ConfirmationMessage() {
  return (
    <small>
      <ins>File uploaded successfully!</ins>
    </small>
  );
}
