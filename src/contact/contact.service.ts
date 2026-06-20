import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { CreateContactDto } from './dto/create-contact.dto';

@Injectable()
export class ContactService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  async create(createContactDto: CreateContactDto) {
    const submission = await this.prisma.contactSubmission.create({
      data: createContactDto,
    });

    // Send email notification asynchronously
    this.mailService.sendContactSubmissionEmail(createContactDto).catch(() => {
      // Handled in MailService, catch block is to ensure no unhandled promise warnings
    });

    return {
      success: true,
      message: 'Contact submission received successfully',
      data: submission,
    };
  }
}
