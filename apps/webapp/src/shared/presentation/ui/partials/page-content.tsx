import { PropsWithChildren } from "@kitajs/html";

export function PageContent(props: PropsWithChildren) {
  return (
    <div class="col-sm-10 col-md-10">
      <div class="page-content">
        <div style="row">
          <div class="col-xs-12 col-md-12">
            {props.children}
          </div>
        </div>
      </div>
    </div>
  )
}
