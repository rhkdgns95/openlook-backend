import { Injectable } from "@nestjs/common";
import { Room, RoomDetail } from "../model";

@Injectable()
export class RoomService {
  private rooms: Room[] = [];
  constructor() {}

  findRooms() {
    return this.rooms;
  }

  findRoom(roomNo: number) {
    return this.rooms.find((v) => {
      if (v.no === roomNo) {
        return v;
      }
    });
  }

  findRoomByPositionNo(roomNo: number, positionNo: number) {
    return this.rooms.find((v) => {
      if (v.no === roomNo) {
        return v.details.find((subV) => subV.no === positionNo);
      }
    });
  }

  deleteRoomDetailBySocketId(socketId: string) {
    let removedDetail: RoomDetail | undefined;
    this.rooms = this.rooms.map((v) => {
      v.details = v.details?.filter((v) => {
        if(v.socketId !== socketId) {
          return true;
        } else {
          removedDetail = v;
        }
      }) || [];
      return v;
    });
    return removedDetail;
  }

  addRoom(no: number, roomDetail: RoomDetail) {
    const currentRoom = this.rooms.find((v) => v.no === no);
    let room;
    if (currentRoom) {
      this.rooms = this.rooms.map((v) => {
        if (v.no === no) {
          v.details.push(roomDetail);
        }
        room = v;
        return v;
      });
    } else {
      room = roomDetail;
      this.rooms.push({
        no,
        details: [roomDetail],
      });
    }
    return room as Room;
  }


  updateRoom(no: number, roomDetail: RoomDetail) {
    const currentRoom = this.rooms.find((v) => v.no === no);
    if (currentRoom) {
      currentRoom.details = currentRoom.details.map((v) => {
        if (v.no === roomDetail.no) {
          return {
            ...v,
            socketId: roomDetail.socketId,
          };
        }
        return v;
      });
    }
    return currentRoom as Room;
  }

  removeRoom(no: number, positionNo: number) {
    this.rooms = this.rooms.map((v) => {
      if (v.no === no) {
        v.details = v.details.filter((subV) => subV.no === positionNo);
      }
      return v;
    });
  }
}
