import { NgModule } from '@angular/core';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzListModule } from 'ng-zorro-antd/list';
@NgModule({
  imports: [
    NzModalRef,
    NgZorroAntdModule,
    NzButtonModule,
    NzListModule,
  ],
  exports: [
    NzModalRef,
    NgZorroAntdModule,
    NzButtonModule,
    NzListModule

  ],
  providers: [
    NzModalService,
    NzMessageService,
  ]
})
export class NGZorrModule {}