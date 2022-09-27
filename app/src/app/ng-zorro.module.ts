import { NgModule } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzAutocompleteModule } from 'ng-zorro-antd/auto-complete';
import { NzSliderModule } from 'ng-zorro-antd/slider';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
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
        NzDescriptionsModule
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
        NzUploadModule,
        NzDescriptionsModule

    ],
    providers: [
        NzMessageService,
    ]
})
export class NGZorrModule {}
