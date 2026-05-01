import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ISetting } from '../interface/setting.interface';
import { IDeliverySlot } from '../interface/setting.interface';

@Injectable({
  providedIn: 'root',
})
export class SettingService {

  private http = inject(HttpClient);

  /* =========================================
     🔥 GET SETTINGS (JSON - KEEP AS IS)
  ========================================= */

  getSettingOption(): Observable<ISetting> {
    return this.http.get<ISetting>('assets/data/settings.json');
  }


  /* =========================================
     🔥 GET DELIVERY SLOTS (POST API)
  ========================================= */

getDeliverySlots(): Observable<IDeliverySlot[]> {

  const body = {
    messageInfo: {
      returnValue: 0,
      returnMessage: ""
    },
    userDBConnStr: ""
  };

  return this.http.post<any>(
    'https://dev-api-justbill.itbycloud.com/api/MasterData/get_DeliverySlot',
    body
  ).pipe(
    map(response => {
      

      if (!response || !response.ml_slot) {
        return [];
      }

      return response.ml_slot.filter(
        (slot: IDeliverySlot) => slot.isActive
      );
    })
  );
}

}