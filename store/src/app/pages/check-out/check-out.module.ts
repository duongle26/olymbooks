import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconsProviderModule } from '../../icons-provider.module';

import { CheckOutRoutingModule } from './check-out-routing.module';
import { CheckOutComponent } from './check-out.component';

import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';

@NgModule({
  declarations: [CheckOutComponent],
  imports: [
    CommonModule,
    FormsModule,
    IconsProviderModule,
    CheckOutRoutingModule,
    NzCardModule,
    NzGridModule,
    NzButtonModule,
    NzInputModule
  ]
})
export class CheckOutModule {}