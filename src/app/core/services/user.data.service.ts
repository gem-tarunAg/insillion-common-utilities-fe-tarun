import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class UserDataService {
  userData = signal({
    userName: 'John Doe',
    userAvatar: 'assets/images/profile.png',
  });

  updateUserData(data: Partial<{ userName: string; userAvatar: string }>) {
    this.userData.set({ ...this.userData(), ...data });
  }
}
