import { computed, Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class UserDataService {
  _userInfo = signal({
    userName: 'John Doe',
    userAvatar: 'assets/images/profile.png',
  });

  readonly userInfo = computed(() => this._userInfo());

  updateUserData(data: Partial<{ userName: string; userAvatar: string }>) {
    this._userInfo.set({ ...this._userInfo(), ...data });
  }
}
