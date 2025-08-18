import { PropsWithChildren } from "@kitajs/html";
import { Header } from "../partials/header";
import { Footer } from "../partials/footer";
import { Content } from "../partials/content";

type MainLayoutProps = {
  head: string | JSX.Element;
  title: string;
}

export function Layout(props: PropsWithChildren<MainLayoutProps>) {
  const { head, title, children } = props;
  return (
    <html lang="en" data-theme="light">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title}</title>
        <meta name="color-scheme" content="light dark"></meta>
        <link rel="stylesheet" href="css/pico.pink.css"></link>
        <link rel="stylesheet" href="css/flexboxgrid.css"></link>
        <link rel="stylesheet" href="css/main-layout.css"></link>
        <script defer src="https://cdn.jsdelivr.net/npm/htmx.org@2.0.6/dist/htmx.min.js" integrity="sha384-Akqfrbj/HpNVo8k11SXBb6TlBWmXXlYQrCSqEWmyKJe+hDm3Z/B2WVG4smwBkRVm" crossorigin="anonymous"></script>
        {head}
      </head>
      <body>
        <Header />
        <Content>{children}</Content>
        <Footer />
      </body>
    </html>
  );
};
