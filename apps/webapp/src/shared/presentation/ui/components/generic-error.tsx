import type { PropsWithChildren } from "@kitajs/html";

export function GenericErrorAlert(props: PropsWithChildren<{errors: string[]}>) {
  return (
    <small>
      <del>Error(s): {props.errors.toString()}</del>
    </small>
  );
}
