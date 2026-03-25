import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { SummaryEntry } from "@prj-conq/behave";
import { DataFetchController } from "../controllers/data-fetch.controller";

@customElement("pq-summary-cards")
export class PqSummaryCards extends LitElement {
  static override styles = css`
    :host {
      display: block;
      font-family: var(--pq-chart-font-family, system-ui, sans-serif);
      color: var(--pq-chart-text, #e0e0e0);
      background: var(--pq-chart-bg, #1e1e2e);
    }
    .cards {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 1rem;
      padding: 1rem;
    }
    .card {
      background: var(--pq-chart-surface, rgba(255,255,255,0.05));
      border: 1px solid var(--pq-chart-border, rgba(255,255,255,0.1));
      border-radius: 8px;
      padding: 1rem;
      text-align: center;
    }
    .card-value {
      font-size: 2rem;
      font-weight: 700;
      color: var(--pq-chart-accent, #7c3aed);
      line-height: 1;
      margin-bottom: 0.5rem;
    }
    .card-label {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      opacity: 0.8;
      word-break: break-word;
    }
    .state-message {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 200px;
      color: var(--pq-chart-text, #e0e0e0);
    }
  `;

  private fetcher = new DataFetchController<SummaryEntry>(this);

  @property({ type: Array }) data?: SummaryEntry[];
  @property() src?: string;

  protected override async updated(changed: Map<string, unknown>): Promise<void> {
    if (changed.has("src") || changed.has("data"))
      await this.fetcher.fetch(this.src ?? "", !!this.data);
  }

  private get resolvedData(): SummaryEntry[] {
    return this.data ?? this.fetcher.data ?? [];
  }

  private formatValue(value: number): string {
    if (Number.isInteger(value)) return value.toLocaleString();
    return value.toFixed(1);
  }

  protected override render() {
    if (this.fetcher.state === "loading")
      return html`<div class="state-message"><slot name="loading">Loading…</slot></div>`;
    if (this.fetcher.state === "error")
      return html`<div class="state-message"><slot name="error">Failed to load data.</slot></div>`;

    const items = this.resolvedData;
    if (items.length === 0)
      return html`<div class="state-message"><slot name="empty">No data.</slot></div>`;

    return html`
      <div class="cards">
        ${items.map(
          (entry) => html`
            <div class="card">
              <div class="card-value">${this.formatValue(entry.value)}</div>
              <div class="card-label">${entry.statistic.replace(/-/g, " ")}</div>
            </div>
          `
        )}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pq-summary-cards": PqSummaryCards;
  }
}
