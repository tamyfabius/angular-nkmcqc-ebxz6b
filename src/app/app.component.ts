import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DofTicketAttachmentModel, Exemption } from '@skynes/dof/domain';
import { LabelValueModel } from '@skynes/shared/su7-models';

/**
 * @class AttachmentComponent
 * @description Attachment component
 */
@Component({
  selector: 'dofin-attachment',
  templateUrl: './attachment.component.html',
  styleUrls: ['./attachment.component.scss'],
})
export class AttachmentComponent {
  /**
   * @description Input dof ticket attachment
   */
  @Input() dofTicketAttachment: DofTicketAttachmentModel =
    new DofTicketAttachmentModel();

  /**
   * @description Input styleClass
   */
  @Input() styleClass = '';

  /**
   * @description Input send attachent loading
   */
  @Input() sendAttachmentLoading = false;

  /**
   * @description Input send attachent loading
   */

  /**
   * @description Display send attachment button
   */
  @Input() displaySendAttachmentButton = true;

  /**
   * @description Upload file event emitter
   */
  @Output() uploadFile = new EventEmitter<DofTicketAttachmentModel>();

  /**
   * @description Add exemption ticket number
   */
  @Output() addExemptionTicket = new EventEmitter<string>();

  /**
   * @description Attachment to send
   */
  attachmentToSend: DofTicketAttachmentModel = new DofTicketAttachmentModel();
  readonly ExemptionEnum = Exemption;
  exemptionConf: {
    exemptionRequested: string;
    exemptionSelected: string | null;
  } = {
    exemptionRequested: 'false',
    exemptionSelected: null,
  };
  exemptionRequestedOptions: LabelValueModel[] = [
    { label: 'Yes', value: 'true' },
    { label: 'No', value: 'false' },
  ];
  exemptionOptions: LabelValueModel[] = [
    this.ExemptionEnum.exemptionTicket,
    this.ExemptionEnum.drive,
  ];

  constructor() {}

  /**
   * @function onBuildDataToSend
   * @param type
   * @param event
   * @description Build data to send event callback
   */
  onBuildDataToSend(type: string, event: any): void {
    this.attachmentToSend.ticket_id = this.dofTicketAttachment.ticket_id;
    if (type === 'architecture') {
      this.attachmentToSend.architecture_diagram_file = event?.currentFiles[0];
    }
    if (type === 'exemption') {
      this.attachmentToSend.exemption_file = event?.currentFiles[0];
    }
  }

  /**
   * @function onUploadFile
   * @description Upload file event callback
   */
  onUploadFile(): void {
    this.uploadFile.emit(this.attachmentToSend);
  }

  /**
   * @function onExemptionRequested
   * @param exemptionRequested
   */
  onExemptionRequested(exemptionRequested: string): void {
    this.exemptionConf = {
      exemptionRequested,
      exemptionSelected: null,
    };
    console.log('onExemptionRequested - exemptionConf', this.exemptionConf);
  }

  /**
   * @function onExemptionOptions
   * @param exemptionSelected
   */
  onExemptionOptions(exemptionSelected: string): void {
    this.exemptionConf = {
      ...this.exemptionConf,
      exemptionSelected,
    };
  }
}
