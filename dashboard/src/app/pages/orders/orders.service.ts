import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseService } from 'src/app/shared/Base/base.service';
import { Order } from 'src/app/shared/Interfaces/order.interface';
import { Pagination } from 'src/app/shared/Interfaces/pagination.interface';

@Injectable({
  providedIn: 'root'
})
export class OrdersService extends BaseService<Order> {
  getMany(params): Observable<Pagination<Order[]> | Order[]> {
    return this.http.get<Pagination<Order[]> | Order[]>(`${this.baseUrl}/orders`, { params });
  }
}
