import { Component } from "@angular/core";

import { Breadcrumb } from "../../../shared/components/widgets/breadcrumb/breadcrumb";
import { IBreadcrumb } from "../../../shared/interface/breadcrumb.interface";

@Component({
  selector: "app-service",
  standalone: true,
  imports: [Breadcrumb],
  templateUrl: "./service.html",
  styleUrl: "./service.scss",
})
export class ServiceComponent {
  breadcrumb: IBreadcrumb = {
    title: "Services",
    items: [{ label: "Services", active: true }],
  };
}
