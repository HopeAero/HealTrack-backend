import { Module } from "@nestjs/common";
import { FAQsService } from "./faqs.service";
import { FAQsController } from "./faqs.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { FAQ } from "./entities/faq.entity";

@Module({
  imports: [TypeOrmModule.forFeature([FAQ])],
  controllers: [FAQsController],
  providers: [FAQsService],
  exports: [FAQsService, TypeOrmModule],
})
export class FAQsModule {}
