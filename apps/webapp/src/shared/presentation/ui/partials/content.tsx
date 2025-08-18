import { PropsWithChildren } from "@kitajs/html";

export function Content(props: PropsWithChildren) {
  return (
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
              {props.children}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
