import { Injectable, Logger } from "@nestjs/common";
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { RoomService } from "../service";

enum Channel {
  CREATE_ROOM = "CREATE_ROOM",
  CREATE_USER = "CREATE_USER",
  UPDATE_USER = "UPDATE_USER",
  CONNECT_USER_TO_ROOM = "CONNECT_USER_TO_ROOM",
  JOIN_ROOM = "JOIN_ROOM",
}

const users = {};
const socketToRoom = {};

@WebSocketGateway()
export class SocketIoGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  @WebSocketServer()
  private wss: Server;
  private logger: Logger = new Logger("AppGateway");
  private rooms: any[] = [];

  public users = {};
  public socketToRoom = {};

  constructor(private readonly roomService: RoomService) {}

  afterInit(server: Server) {
    this.logger.log("Initialized!");
  }
  handleConnection(client: Socket, ...args: any[]) {

    // this.logger.log("Client connected: ", client.id);
  }

  handleDisconnect(socket: Socket) {
    console.log("handleDisconnect: ", socket.id);
    const roomDetail = this.roomService.deleteRoomDetailBySocketId(socket.id);
    this.wss.emit("DISCONNECT", roomDetail?.no);
    // // console.log("disconnect client: ", client);
    // const roomId = socketToRoom[socket.id];

    // // console.log("BEFORE: ", users[roomId]);
    // if (users[roomId]) {
    //   users[roomId] = users[roomId].filter((v) => v.socketId !== socket.id);
    // }
    // console.log("AFTER: ", users[roomId]);

    // this.wss.emit("ALREADY_USERS", users[roomId]);
  }

  /** 방참가 */
  @SubscribeMessage("JOIN")
  join(socket: Socket, payload: { roomNo: number; positionNo: number }) {
    const room = this.roomService.updateRoom(payload.roomNo, {
      no: payload.positionNo,
      socketId: socket.id,
      userName: "power",
    });
    const beforeRoom =
      room?.details?.filter((v) => v.socketId !== socket.id) || [];
    console.log("room: ", beforeRoom);
    console.log("beforeRoom: ", beforeRoom);
    socket.emit("GET_CURRENT_ROOM", beforeRoom);
  }

  @SubscribeMessage("JOIN_ROOM")
  joinRoom(socket: Socket, payload: { roomId: number; positionId: number }) {
    const { roomId, positionId } = payload;

    console.log("join room - roomId: ", roomId);
    console.log("join room - positionId: ", positionId);
    if (users[roomId]) {
      const length = users[roomId].length;
      console.log("length: ", length);
      if (length === 4) {
        socket.emit("room full");
        return;
      }
      users[roomId].push({ positionId, socketId: socket.id });
      // users[roomId].push(socket.id);
    } else {
      users[roomId] = [{ positionId, socketId: socket.id }];
    }
    socketToRoom[socket.id] = roomId;

    const usersInThisRooms = users[roomId].filter(
      (v) => v.positionId !== positionId
    );
    // const usersInThisRoom = users[roomId].filter((id) => id !== socket.id);
    console.log("users[roomId]: ", users[roomId]);
    console.log("usersInThisRooms: ", usersInThisRooms);
    socket.emit("ALREADY_USERS", usersInThisRooms);
    // this.wss.emit(Channel.CREATE_USER, user);
  }

  // @SubscribeMessage("RECEIVING SIGNAL")
  // receivingSignal2(socket: Socket, payload) {
  //   this.wss.to(payload.callerId).emit("receiving returned signal", {
  //     signal: payload.signal,
  //     id: socket.id,
  //   });
  // }

  @SubscribeMessage("SENDING SIGNAL")
  sendingSignal2(socket: Socket, payload) {
    this.wss.to(payload.userToSignal).emit("USER JOIN", {
      signal: payload.signal,
      callerId: payload.callerId,
      no: payload.no,
    });
  }

  @SubscribeMessage("RETURNING SIGNAL")
  returningSignal2(socket: Socket, payload) {
    this.wss.to(payload.callerId).emit("RECEIVING SIGNAL", {
      signal: payload.signal,
      id: socket.id,
    });
  }


  @SubscribeMessage("SENDING_SIGNAL")
  sendingSignal(socket: Socket, payload) {
    this.wss.to(payload.userToSignal).emit("USER_JOIN", {
      signal: payload.signal,
      callerId: payload.callerId,
      positionId: payload.positionId,
    });
  }
  @SubscribeMessage("returning signal")
  returningSignal(socket: Socket, payload) {
    this.wss.to(payload.callerId).emit("receiving returned signal", {
      signal: payload.signal,
      id: socket.id,
    });
  }

  // @SubscribeMessage("connect-room1")
  // createUser(client: Socket, data: any) {
  //   console.log('createUSer:"', data);
  //   this.wss.emit("connectToNewUser", data);
  //   // this.wss.emit(Channel.CREATE_USER, user);
  // }

  // @SubscribeMessage(Channel.CREATE_ROOM)
  createRoom(room: any) {
    // this.wss.emit(Channel.CREATE_ROOM, room);
  }

  // @SubscribeMessage("join-room")
  // handleMessage(
  //   client: Socket,
  //   data: { roomId: string; userId: string; user: User }
  // ): void {
  //   const { roomId, userId, user } = data;
  //   this.logger.log("data ", JSON.stringify(data));
  //   this.rooms = this.rooms.map((v) => {
  //     if (v.id === roomId) {
  //       Object.assign(user, {
  //         peerId: userId,
  //       });
  //       return {
  //         ...v,
  //         count: v.count + 1,
  //         users: [...v.users, user],
  //       };
  //     } else {
  //       return v;
  //     }
  //   });
  //   client.join(roomId);
  //   client.to(roomId).broadcast.emit("user-connected", userId);
  //   client.to(roomId).broadcast.emit("video-stream");
  //   this.wss.emit("get-rooms", {
  //     rooms: this.rooms,
  //     users: this.users,
  //   });
  //   client.on("disconnect", (data) => {
  //     console.log("Close: ", data);
  //     this.rooms = this.rooms.map((v) => {
  //       if (v.id === roomId) {
  //         const users = v.users.filter((v2) => v2.peerId !== userId);
  //         return { ...v, count: v.count - 1, users };
  //       } else {
  //         return v;
  //       }
  //     });
  //     this.wss.emit("get-rooms", {
  //       users: this.users,
  //       rooms: this.rooms,
  //     });
  //     client.to(roomId).broadcast.emit("user-disconnected", userId);
  //   });
  //   client.on("close", (data) => {
  //     console.log("disconnect: ", data);
  //     this.rooms = this.rooms.map((v) => {
  //       if (v.id === roomId) {
  //         const users = v.users.filter((v2) => v2.peerId !== userId);
  //         return { ...v, count: v.count - 1, users };
  //       } else {
  //         return v;
  //       }
  //     });
  //     this.wss.emit("get-rooms", {
  //       users: this.users,
  //       rooms: this.rooms,
  //     });
  //     client.to(roomId).broadcast.emit("user-disconnected", userId);
  //   });
  //   // this.wss.emit("user-connected", data.userId);
  //   // client.join(data.roomId);
  //   // client.to(data.roomId).broadcast.emit('user-connected', data.userId);
  //   // client.emit("user-connected", data.userId);
  //   // this.wss.emit("msgToClient: ", text);
  // }

  // @SubscribeMessage("get-rooms")
  // getRooms(client: Socket, data: User) {
  //   console.log("get-rooms1: ", client.id);
  //   console.log("get-rooms: ", data);
  //   this.updateToUserActive({
  //     ...data,
  //     socketId: client.id,
  //   });
  //   this.wss.emit("get-rooms", {
  //     users: this.users,
  //     rooms: this.rooms,
  //   });
  // }

  // @SubscribeMessage("create-room")
  // createRoom(client: Socket, data: any) {
  //   console.log("Create room : ", data);
  //   this.rooms.push(data);
  //   this.appService.addRoom(data);
  //   this.wss.emit("get-rooms", {
  //     users: this.users,
  //     rooms: this.rooms,
  //   });
  // }

  // @SubscribeMessage("message")
  // handleMe(client: Socket, data: string) {
  //   this.wss.emit("message", data);
  // }
}
