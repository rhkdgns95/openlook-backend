import {
  Body,
  Controller,
  Get,
  NotAcceptableException,
  Param,
  ParseIntPipe,
  Post,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { SocketIoGateway } from "../gateway";
import { RoomService } from "../service";

class ConnectRoomInput {}

@ApiTags("방정보")
@Controller("room")
export class RoomController {
  constructor(
    private readonly socketIoGateway: SocketIoGateway,
    private readonly roomService: RoomService
  ) {}

  @Get()
  async getRooms() {
    return this.roomService.findRooms();
  }

  @Post(":roomNo/position/:positionNo")
  async connectRoom(
    @Param("roomNo", ParseIntPipe) roomNo: number,
    @Param("positionNo", ParseIntPipe) positionNo: number,
    @Body()
    input: ConnectRoomInput
  ) {
    const room = this.roomService.findRoomByPositionNo(roomNo, positionNo);
    if(room) {
      throw new NotAcceptableException('이미 존재하는 방입니다.');
    }
    this.roomService.addRoom(roomNo, {
      no: positionNo,
      userName: "power",
      socketId: "",
    });

    // console.log("currentRooms: " , rooms);
    // console.log("room: " , room);

    // console.log("this.socketIoGateway.users: ", this.socketIoGateway.users);
    // console.log("roomNo: ", roomNo);
    // console.log("positionNo: ", positionNo);
    // console.log("input: ", input);

    return {
      ok: true,
      roomNo: Number(roomNo),
      positionNo: Number(positionNo),
      // endpoint: `http://localhost:3000/room/${roomNo}`,
    };
    // this.socketIoGateway.createRoom(room);
    // return room;
  }
}
