import { Module } from "@nestjs/common";
import { RoomController } from "../controller";
import { SocketIoGateway } from "../gateway";
import { RoomService } from "../service";

@Module({
  imports: [],
  controllers: [RoomController],
  providers: [SocketIoGateway, RoomService],
})
export class AppModule {}
