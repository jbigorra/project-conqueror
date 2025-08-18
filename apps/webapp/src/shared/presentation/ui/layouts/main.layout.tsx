import { PropsWithChildren } from "@kitajs/html";

type MainLayoutProps = {
  head: string | JSX.Element;
  title: string;
}

export const MainLayout = (props: PropsWithChildren<MainLayoutProps>) => {
  const { head, title, children } = props;
  return (
    <html lang="en" data-theme="light">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title}</title>
        <meta name="color-scheme" content="light dark"></meta>
        <link rel="stylesheet" href="css/flexboxgrid.css"></link>
        <link rel="stylesheet" href="css/pico.pink.css"></link>
        <link rel="stylesheet" href="css/main-layout.css"></link>
        <script defer src="https://cdn.jsdelivr.net/npm/htmx.org@2.0.6/dist/htmx.min.js" integrity="sha384-Akqfrbj/HpNVo8k11SXBb6TlBWmXXlYQrCSqEWmyKJe+hDm3Z/B2WVG4smwBkRVm" crossorigin="anonymous"></script>
        {head}
      </head>
      <body>
        <header class="container-fluid">
          <nav>
            <ul>
              <li>
              <hgroup>
                <h2>TD Radar</h2>
                <mark>Pay the tech debt that matters</mark>
              </hgroup>
              </li>
            </ul>
            <ul>
              <li><a href="#" class="contrast">Analyze my repo</a></li>
              <li><a href="#" class="contrast">What's this?</a></li>
              <li><a href="#" class="contrast">Docs</a></li>
              <li><a href="#" class="contrast">Buy me a coffee</a></li>
            </ul>
          </nav>
        </header>
        <main class="container-fluid">
          <div class="row">
            <aside class="col-sm-2 col-md-2" style="background-color: #f0f0f0;">
              <nav>
                <ul>
                  <li><a href="#"><button class="secondary">Hotspots</button></a></li>
                  <li><a href="#"><button class="secondary">Knowledge Distribution</button></a></li>
                  <li><a href="#"><button class="secondary">Change Coupling</button></a></li>
                  <li><a href="#"><button class="secondary">Entity Churn</button></a></li>
                </ul>
              </nav>
            </aside>
            <div class="col-sm-10 col-md-10">
              <div style="padding-left: 0.5rem">
                <div class="col-xs-12 col-md-12" style="border: 1px dashed #000;">
                  {children}
                </div>
              </div>
            </div>
          </div>
        </main>
        <footer>
          <div class="container-fluid">
            <div class="row">
              <div class="col-xs-12 col-md-12">
                <p>Copyright 2025 TD Radar</p>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
};
