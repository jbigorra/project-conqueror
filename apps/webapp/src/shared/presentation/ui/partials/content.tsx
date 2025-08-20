import { PropsWithChildren } from "@kitajs/html";
import { AsideMenu } from "./aside-menu";
import { PageContent } from "./page-content";

export function Content(props: PropsWithChildren) {
  return (
    <main class="container-fluid">
      <div class="row">
        <AsideMenu />
        <PageContent>
          {props.children}
        </PageContent>
      </div>
    </main>
  )
}
