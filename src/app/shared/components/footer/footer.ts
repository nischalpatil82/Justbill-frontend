import { Component, inject, input, OnInit } from "@angular/core";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { Store } from "@ngxs/store";
import { Observable } from "rxjs";
import { FooterFour } from "./footer-four/footer-four";
import { FooterOne } from "./footer-one/footer-one";
import { FooterThree } from "./footer-three/footer-three";
import { FooterTwo } from "./footer-two/footer-two";
import { IOption } from "../../../shared/interface/theme-option.interface";
import { ThemeOptionState } from "../../store/state/theme-option.state";

@Component({
  selector: "app-footer",
  imports: [FooterOne, FooterTwo, FooterThree, FooterFour],
  templateUrl: "./footer.html",
  styleUrl: "./footer.scss",
})
export class Footer implements OnInit {
  private router = inject(Router);
  route = inject(ActivatedRoute);
  readonly logo = input<string>();
  themeOption$: Observable<IOption> = inject(Store).select(
    ThemeOptionState.themeOptions,
  ) as Observable<IOption>;

  public type: string = "footer_one"; // Default for Veg 4
  public path: string = "vegetables_four";
  public themeOptions!: IOption;

  public hideFooter: boolean = false;

  ngOnInit(): void {
    // ✅ 1. Run immediately
    this.checkUrlAndSetFooter();

    this.route.queryParams.subscribe((params) => {
      if (params["theme"]) {
        this.path = params["theme"];
      }
      this.checkUrlAndSetFooter();
    });

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.checkUrlAndSetFooter();
      }
    });
  }

  checkUrlAndSetFooter() {
    const currentUrl = this.router.url;

    this.hideFooter = false;

    this.themeOption$.subscribe((option) => {
      const StoreJson = option ? JSON.parse(JSON.stringify(option)) : {};

      // ✅ 2. Force vegetables_four if path is empty
      const currentPath = this.path || "vegetables_four";

      if (currentPath == "vegetables_four") {
        this.type = "footer_one";
      } else if (
        currentPath == "fashion_three" ||
        currentPath == "furniture_one" ||
        currentPath == "furniture_two" ||
        currentPath == "fashion_four" ||
        currentPath == "fashion_five" ||
        currentPath == "fashion_seven" ||
        currentPath == "furniture_dark" ||
        currentPath == "electronics_one" ||
        currentPath == "electronics_two" ||
        currentPath == "marketplace_one" ||
        currentPath == "marketplace_four" ||
        currentPath == "vegetables_one" ||
        currentPath == "vegetables_two" ||
        currentPath == "jewellery_two" ||
        currentPath == "vegetables_three" ||
        currentPath == "jewellery_three" ||
        currentPath == "watch" ||
        currentPath == "medical" ||
        currentPath == "kids" ||
        currentPath == "books" ||
        currentPath == "beauty" ||
        currentPath == "left_sidebar" ||
        currentPath == "goggles" ||
        currentPath == "video_slider" ||
        currentPath == "flower" ||
        currentPath == "perfume" ||
        currentPath == "gradient" ||
        currentPath == "surfboard" ||
        currentPath == "video"
      ) {
        this.type = "footer_one";
      } else if (
        currentPath == "fashion_two" ||
        currentPath == "fashion_six" ||
        currentPath == "bag" ||
        currentPath == "marijuana" ||
        currentPath == "game" ||
        currentPath == "shoes" ||
        currentPath == "jewellery_one" ||
        currentPath == "single_product"
      ) {
        this.type = "footer_two";
      } else if (
        currentPath == "fashion_one" ||
        currentPath == "electronics_three" ||
        currentPath == "marketplace_three" ||
        currentPath == "bicycle" ||
        currentPath == "marketplace_two" ||
        currentPath == "pets" ||
        currentPath == "nursery" ||
        currentPath == "full_page"
      ) {
        this.type = "footer_three";
      } else if (
        currentPath == "digital_download" ||
        currentPath == "christmas" ||
        currentPath == "tools" ||
        currentPath == "gym"
      ) {
        if (StoreJson.footer)
          StoreJson.footer["bg_image"] = "/images/footer/footer.png";
        this.type = "footer_four";
      } else {
        this.type = "footer_one";
      }

      this.themeOptions = StoreJson;
    });
  }
}
