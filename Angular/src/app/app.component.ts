import { Component, ViewChild, AfterViewChecked } from '@angular/core';
import { DxDataGridComponent, DxDataGridTypes } from 'devextreme-angular/ui/data-grid';
import notify from 'devextreme/ui/notify';
import { Customer, Service } from './app.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [Service],
})
export class AppComponent implements AfterViewChecked {
  @ViewChild(DxDataGridComponent, { static: false }) dataGrid: DxDataGridComponent | undefined;

  checked = false;

  changes: DxDataGridTypes.DataChange[] = [];

  pattern = /^\(\d{3}\) \d{3}-\d{4}$/i;

  customers: Customer[];

  constructor(service: Service) {
    this.customers = service.getCustomers();
    this.validateVisibleRows = this.validateVisibleRows.bind(this);
  }

  validateVisibleRows(): void {
    const dataGridInstance = this?.dataGrid?.instance;
    const currentChanges = (dataGridInstance?.option('editing.changes') as DxDataGridTypes.DataChange[]).filter((c) => {
      return Object.keys(c.data).length > 0;
    });
    const fakeChanges = dataGridInstance
      ? dataGridInstance.getVisibleRows().map((row: DxDataGridTypes.Row): DxDataGridTypes.DataChange => ({ type: 'update', key: row.key, data: {} }))
      : [];
    this.changes = [...currentChanges, ...fakeChanges];
    this.checked = true;
  }

  ngAfterViewChecked(): void {
    if (this.changes.length && this.checked) {
      this.checked = false;
      const dataGridInstance = this?.dataGrid?.instance;
      dataGridInstance?.repaint();
      // @ts-expect-error - getController is a private method
      dataGridInstance?.getController('validating').validate(true).then((result: Boolean) => {
        const message = result ? 'Validation is passed' : 'Validation is failed';
        const type = result ? 'success' : 'error';
        notify({
          message,
          type,
          position: {
            offset: '0 50',
            at: 'bottom',
            of: '.demo-container',
          },
        });
      });
    }
  }
}
