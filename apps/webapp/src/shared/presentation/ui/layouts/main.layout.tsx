import { PropsWithChildren } from "@kitajs/html";

type MainLayoutProps = {
  head: string;
  title: string;
}

export const MainLayout = (props: PropsWithChildren<MainLayoutProps>) => {
  const { head, title, children } = props;
  return (
    <>
      {'<!doctype html>'}
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>{title || 'Hello World!'}</title>
          {head}
        </head>
        <body>{children}</body>
        <script defer src="https://cdn.jsdelivr.net/npm/htmx.org@2.0.6/dist/htmx.min.js" integrity="sha384-Akqfrbj/HpNVo8k11SXBb6TlBWmXXlYQrCSqEWmyKJe+hDm3Z/B2WVG4smwBkRVm" crossorigin="anonymous"></script>
      </html>
    </>
  );
};
