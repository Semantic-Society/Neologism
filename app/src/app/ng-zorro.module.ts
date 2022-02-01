import { NgModule } from '@angular/core';
import { NzAutocompleteModule } from 'ng-zorro-antd/auto-complete';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSliderModule } from 'ng-zorro-antd/slider';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzUploadModule } from 'ng-zorro-antd/upload';

@NgModule({
    imports: [
        NzPaginationModule,
        NzAvatarModule,
        NzTableModule,
        NzRadioModule,
        NzSliderModule,
        NzAutocompleteModule,
        NzCardModule,
        NzBreadCrumbModule,
        NzDrawerModule,
        NzDropDownModule,
        NzModalModule,
        NzTabsModule,
        NzSelectModule,
        NzInputNumberModule,
        NzInputModule,
        NzFormModule,
        NzPageHeaderModule,
        NzMenuModule,
        NzDividerModule,
        NzIconModule,
        NzLayoutModule,
        NzButtonModule,
        NzListModule,
        NzUploadModule,
    ],
    exports: [
        NzPaginationModule,
        NzAvatarModule,
        NzTableModule,
        NzRadioModule,
        NzSliderModule,
        NzAutocompleteModule,
        NzCardModule,
        NzBreadCrumbModule,
        NzDrawerModule,
        NzButtonModule,
        NzListModule,
        NzDropDownModule,
        NzModalModule,
        NzTabsModule,
        NzSelectModule,
        NzInputNumberModule,
        NzInputModule,
        NzFormModule,
        NzPageHeaderModule,
        NzMenuModule,
        NzDividerModule,
        NzIconModule,
        NzLayoutModule,
        NzUploadModule

    ],
    providers: [
        NzMessageService,
    ]
})
export class NGZorrModule {}
