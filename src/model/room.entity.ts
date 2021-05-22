export class RoomDetail {
  /** 소켓 ID */
  socketId: string;
  /** 자리 */
  no: number;
  userName: string;
}

export class Room {
  no: number;
  details: RoomDetail[];
}
