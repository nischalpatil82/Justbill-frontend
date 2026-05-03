import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, inject, NgZone, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';

import { environment } from '../../../../environments/environment';
import { AddToCartAction, UpdateCartAction, DeleteCartAction, ClearCartAction, ToggleSidebarCartAction } from '../../../shared/store/action/cart.action';
import { AddToWishlistAction, DeleteWishlistAction } from '../../../shared/store/action/wishlist.action';
import { AddToCompareAction, DeleteCompareAction }   from '../../../shared/store/action/compare.action';
import { GetProductBySearchListAction }               from '../../../shared/store/action/product.action';
import { IProduct }                                   from '../../../shared/interface/product.interface';
import { ICartAddOrUpdate }                           from '../../../shared/interface/cart.interface';

interface ChatMessage {
  role: 'bot' | 'user';
  text: string;
  intent?: string;
  time: string;
}

interface VoiceAction {
  type: string;
  params: Record<string, any>;
}

interface VoiceFrontendContext {
  page_url: string;
  locale: string;
  active_filters: Record<string, any>;
  selected_product: Record<string, any>;
  visible_products: Array<Record<string, any>>;
  cart_snapshot: Array<Record<string, any>>;
}

@Component({
  selector: 'app-voice-assistant',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './voice-assistant.html',
  styleUrl:    './voice-assistant.scss',
})
export class VoiceAssistant implements OnInit, OnDestroy {

  private store          = inject(Store);
  private router         = inject(Router);
  private platformId     = inject<Object>(PLATFORM_ID);
  private zone           = inject(NgZone);

  isOpen      = false;
  isLoading   = false;
  isListening = false;
  isOnline    = false;
  isSpeaking  = false;
  inputText   = '';
  messages: ChatMessage[] = [];

  private apiBase = (environment.aiApiURL || '/.netlify/functions').replace(/\/+$/, '');

  private recognition: any = null;
  private sessionId: string = '';
  ttsEnabled = true;

  chips = [
    { label: '💎 Rings',     cmd: 'show rings'          },
    { label: '📿 Necklaces', cmd: 'show necklaces'      },
    { label: '👂 Earrings',  cmd: 'show earrings'       },
    { label: '🛒 Cart',      cmd: 'show my cart'        },
    { label: '❤️ Wishlist',  cmd: 'show my wishlist'    },
    { label: '🔍 Search',    cmd: 'search diamond ring' },
    { label: '💳 Checkout',  cmd: 'go to checkout'      },
    { label: '📦 Orders',    cmd: 'show my orders'      },
    { label: '🏷️ Offers',   cmd: 'show current offers'  },
    { label: '⭐ Popular',   cmd: 'show popular items'  },
  ];

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.initSpeech();
      this.loadSession();
      this.loadMessages();
      this.checkHealth(true);
    }
  }

  ngOnDestroy() {
    if (this.recognition) this.recognition.abort();
    this.stopTTS();
  }

  // ── Session Management ──────────────────────────────────────────────────
  private loadSession() {
    try {
      this.sessionId = localStorage.getItem('va-session-id') || this.generateSessionId();
      localStorage.setItem('va-session-id', this.sessionId);
    } catch {
      this.sessionId = this.generateSessionId();
    }
  }

  private generateSessionId(): string {
    return Math.random().toString(36).substring(2, 14);
  }

  // ── Message Persistence ─────────────────────────────────────────────────
  private loadMessages() {
    try {
      const saved = localStorage.getItem('va-messages');
      if (saved) {
        const parsed = JSON.parse(saved) as ChatMessage[];
        // Only load last 50 messages
        this.messages = parsed.slice(-50);
      }
    } catch { /* ignore */ }
  }

  private saveMessages() {
    try {
      // Save last 50 messages
      const toSave = this.messages.slice(-50);
      localStorage.setItem('va-messages', JSON.stringify(toSave));
    } catch { /* ignore */ }
  }

  clearHistory() {
    this.messages = [];
    this.saveMessages();
  }

  // ── Panel Toggle ────────────────────────────────────────────────────────
  togglePanel() {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      setTimeout(() => this.checkHealth(false), 200);
      setTimeout(() => {
        const el = document.getElementById('va-input');
        if (el) (el as HTMLInputElement).focus();
      }, 400);
    }
  }

  closePanel() { this.isOpen = false; }

  // ── Health check ────────────────────────────────────────────────────────
  checkHealth(silent = false) {
    if (!isPlatformBrowser(this.platformId)) return;

    this.zone.runOutsideAngular(() => {
      this.fetchApi('/health', {}, 5000)
        .then(r => r.json())
        .then(d => {
          this.zone.run(() => {
            this.isOnline = true;
            if (!silent && this.messages.length === 0) {
              this.addBot(
                `👋 Welcome to JustBill Jewellery!\n\nI can automate everything:\n` +
                `• 💎 Search & filter jewellery\n` +
                `• 🛒 Add to cart / remove / clear\n` +
                `• ❤️ Add to wishlist\n` +
                `• 📦 View orders\n` +
                `Try: "add diamond ring to cart" or "show gold necklaces"`,
                'GREET'
              );
            }
          });
        })
        .catch(() => {
          this.zone.run(() => {
            this.isOnline = false;
            if (!silent && this.messages.length === 0) {
              this.addBot(
                `⚠️ AI server is not running.\n\nStart it:\npython server.py --project justbill\n\nThen click here again.`,
                'OFFLINE'
              );
            }
          });
        });
    });
  }

  // ── Send Command ────────────────────────────────────────────────────────
  async send(text?: string) {
    const msg = (text || this.inputText).trim();
    if (!msg || this.isLoading) return;

    this.inputText = '';
    this.isLoading = true;
    this.addUser(msg);

    if (!this.isOnline) {
      const recovered = await this.pingHealth();
      this.isOnline = recovered;
      if (!recovered) {
        this.isLoading = false;
        this.addBot(
          `⚠️ AI service is not reachable right now.\n\nCheck the backend or proxy and try again.`,
          'ERROR'
        );
        return;
      }
    }

    try {
      const frontendContext = this.buildVoiceContext();
      const data = await this.sendCommandWithFallback(msg, frontendContext);
      this.isLoading = false;

      // Update session ID if server assigns one
      if (data.session_id) {
        this.sessionId = data.session_id;
        try { localStorage.setItem('va-session-id', this.sessionId); } catch {}
      }

      this.addBot(data.message || 'Done!', data.intent);
      if (data.actions?.length) this.runActions(data.actions);

    } catch {
      this.isLoading = false;
      this.isOnline  = false;
      this.addBot(
        `⚠️ Lost connection to AI service.\n\nPlease try again in a moment.`,
        'ERROR'
      );
    }
  }

  private async sendCommandWithFallback(text: string, frontendContext: VoiceFrontendContext): Promise<any> {
    try {
      const asyncRes = await this.fetchApi('/command-async', {
        method:  'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-ID': this.sessionId,
        },
        body:    JSON.stringify({ text, page: this.router.url, context: frontendContext }),
      }, 10000);

      if (asyncRes.ok) {
        const job = await asyncRes.json();
        if (job?.job_id) {
          return await this.waitForCommandResult(job.job_id, 60000);
        }
      }

      const directRes = await this.fetchApi('/command', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-ID': this.sessionId,
        },
        body: JSON.stringify({ text, page: this.router.url, context: frontendContext }),
      }, 60000);

      if (!directRes.ok) throw new Error(`HTTP ${directRes.status}`);
      return await directRes.json();
    } catch (error) {
      const directRes = await this.fetchApi('/command', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-ID': this.sessionId,
        },
        body: JSON.stringify({ text, page: this.router.url, context: frontendContext }),
      }, 60000);

      if (!directRes.ok) throw error;
      return await directRes.json();
    }
  }

  private async waitForCommandResult(jobId: string, timeoutMs = 60000): Promise<any> {
    const started = Date.now();
    while (Date.now() - started < timeoutMs) {
      const res = await this.fetchApi(`/command-result/${encodeURIComponent(jobId)}`, {}, 10000);
      if (res.status === 202) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        continue;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const payload = await res.json();
      if (payload.status === 'done') return payload.result || payload;
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    throw new Error('Timed out waiting for AI response');
  }

  private async pingHealth(timeoutMs = 7000): Promise<boolean> {
    try {
      const res = await this.fetchApi('/health', {}, timeoutMs);
      return res.ok;
    } catch {
      return false;
    }
  }

  private getApiCandidates(): string[] {
    const candidates: string[] = [this.apiBase];

    if (isPlatformBrowser(this.platformId)) {
      const host = window.location.hostname;
      const protocol = window.location.protocol;
      // Only try host:5004 for local development, never on hosted domains.
      if (host === 'localhost' || host === '127.0.0.1') {
        candidates.push(`${protocol}//${host}:5004`);
      }
    }

    return Array.from(
      new Set(candidates.map(url => (url || '').replace(/\/+$/, '')).filter(Boolean)),
    );
  }

  private async fetchApi(path: string, init: RequestInit = {}, timeoutMs = 10000): Promise<Response> {
    let lastError: unknown;

    for (const base of this.getApiCandidates()) {
      try {
        const response = await fetch(`${base}${path}`, {
          ...init,
          signal: AbortSignal.timeout(timeoutMs),
        });
        this.apiBase = base;
        return response;
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError || new Error('Unable to reach AI server');
  }

  // ── Action Execution ────────────────────────────────────────────────────
  runActions(actions: VoiceAction[]) {
    actions.forEach(({ type, params }) => {
      switch (type) {

        case 'add_to_cart':
          this.doAddToCart(params);
          break;

        case 'remove_from_cart':
          this.doRemoveFromCart(params);
          break;

        case 'update_cart_qty':
          this.doUpdateCartQty(params);
          break;

        case 'clear_cart':
          this.store.dispatch(new ClearCartAction());
          break;

        case 'open_cart':
          this.store.dispatch(new ToggleSidebarCartAction(true));
          break;

        case 'close_cart':
          this.store.dispatch(new ToggleSidebarCartAction(false));
          break;

        case 'add_to_wishlist':
          this.doAddToWishlist(params);
          break;

        case 'remove_from_wishlist':
          this.doRemoveFromWishlist(params);
          break;

        case 'search':
          if (params['query']) {
            this.store.dispatch(new GetProductBySearchListAction({ search: params['query'], status: 1 }));
            this.router.navigate(['/search'], {
              queryParams: { search: params['query'] },
              queryParamsHandling: 'merge',
            });
            setTimeout(() => {
              const si = document.querySelector<HTMLInputElement>(
                'input[placeholder*="Search"], input[placeholder*="search"], .search-input'
              );
              if (si) {
                si.value = params['query'];
                si.dispatchEvent(new Event('input', { bubbles: true }));
              }
            }, 200);
          }
          break;

        case 'add_to_compare':
          if (params['productId']) {
            this.store.dispatch(new AddToCompareAction({ product_id: params['productId'] }));
          }
          break;

        case 'remove_from_compare':
          if (params['compareId']) {
            this.store.dispatch(new DeleteCompareAction(params['compareId']));
          }
          break;

        case 'navigate':
          if (params['url']) {
            setTimeout(() => {
              this.router.navigateByUrl(params['url']);
              this.closePanel();
            }, 500);
          }
          break;

        case 'filter': {
          const qp: Record<string, any> = {};
          if (params['maxPrice']) qp['maxPrice'] = params['maxPrice'];
          if (params['minPrice']) qp['minPrice'] = params['minPrice'];
          if (params['category']) qp['category'] = params['category'];
          if (params['brand'])    qp['brand']    = params['brand'];
          if (params['sort'])     qp['sortBy']   = params['sort'];
          setTimeout(() => {
            this.router.navigate(['/collections'], { queryParams: qp });
            this.closePanel();
          }, 500);
          break;
        }

        case 'set_theme': {
          const body = document.body;
          if (params['theme'] === 'dark') {
            body.classList.add('dark');
            body.classList.remove('light');
          } else {
            body.classList.remove('dark');
            body.classList.add('light');
          }
          const themeBtn = document.querySelector<HTMLElement>(
            '.theme-toggle, #themeToggle, [data-action="toggle-theme"]'
          );
          if (themeBtn) themeBtn.click();
          break;
        }

        case 'bye':
          setTimeout(() => this.closePanel(), 1200);
          break;
      }
    });
  }

 private doAddToCart(params: Record<string, any>) {
  const productId = params['productId'];
  const name      = params['name']  || 'Product';
  const price     = params['price'] || 0;
  const quantity  = params['quantity'] || 1;
  if (!productId) return;

  // Check if item already in cart
  const cartItems = this.store.selectSnapshot((s: any) => s.cart?.items || []);
  const existing  = cartItems.find((i: any) => i.product_id === productId);

  const product = this.mapProduct({
    productID: productId, productName: name,
    sellingPrice: price, costPrice: price,
    quantity: 99, isActive: true,
    productType: 'physical', sku: String(productId),
    primaryImageUrl: params['image'] || null,
  });

  if (existing) {
    const payload: ICartAddOrUpdate = {
      id:           existing.id,
      product:      product,
      product_id:   productId,
      variation:    null,
      variation_id: null,
      quantity:     quantity,
    };
    this.store.dispatch(new UpdateCartAction(payload));
  } else {
    const payload: ICartAddOrUpdate = {
      id:           null,
      product:      product,
      product_id:   productId,
      variation:    null,
      variation_id: null,
      quantity:     quantity,
    };
    this.store.dispatch(new AddToCartAction(payload));
  }

  this.store.dispatch(new ToggleSidebarCartAction(true));
}

  private doRemoveFromCart(params: Record<string, any>) {
    const cartItems = this.store.selectSnapshot((s: any) => s.cart?.items || []);
    const found     = cartItems.find((i: any) => i.product_id === params['productId']);
    if (found) { this.store.dispatch(new DeleteCartAction(found.id)); }
    else        { this.addBot('That item is not in your cart.'); }
  }

  private doUpdateCartQty(params: Record<string, any>) {
    const cartItems = this.store.selectSnapshot((s: any) => s.cart?.items || []);
    const found     = cartItems.find((i: any) => i.product_id === params['productId']);
    if (found) {
      const payload: ICartAddOrUpdate = {
        id: found.id, product: found.product, product_id: found.product_id,
        variation: found.variation, variation_id: found.variation_id,
        quantity: params['quantity'] || 1,
      };
      this.store.dispatch(new UpdateCartAction(payload));
    }
  }

  private doAddToWishlist(params: Record<string, any>) {
    const stored = sessionStorage.getItem('account_user');
    if (!stored) {
      this.addBot('Please login first to save items to your wishlist.');
      setTimeout(() => { this.router.navigateByUrl('/auth/login'); this.closePanel(); }, 1000);
      return;
    }
    const user       = JSON.parse(stored);
    const customerID = user?.m_customer?.id;
    if (!customerID || !params['productId']) return;
    const wishlist = this.store.selectSnapshot((s: any) => s.wishlist?.wishlist?.data || []);
    const existing = wishlist.find((i: any) => i.productID === params['productId']);
    if (existing) { this.addBot(`${params['name'] || 'This item'} is already in your wishlist ❤️`); }
    else           { this.store.dispatch(new AddToWishlistAction(params['productId'], customerID)); }
  }

  private doRemoveFromWishlist(params: Record<string, any>) {
    const stored = sessionStorage.getItem('account_user');
    if (!stored) return;
    const user       = JSON.parse(stored);
    const customerID = user?.m_customer?.id;
    const wishlist   = this.store.selectSnapshot((s: any) => s.wishlist?.wishlist?.data || []);
    const existing   = wishlist.find((i: any) => i.productID === params['productId']);
    if (existing && customerID) {
      this.store.dispatch(new DeleteWishlistAction(existing.id, params['productId'], customerID));
    }
  }

  private mapProduct(p: any): IProduct {
    return {
      id: p.productID, name: p.productName,
      slug: p.sku || String(p.productID),
      sale_price: Number(p.sellingPrice),
      price:      Number(p.costPrice),
      quantity:   p.quantity, status: p.isActive,
      product_type: p.productType || 'physical',
      product_thumbnail: p.primaryImageUrl
        ? { original_url: p.primaryImageUrl, mime_type: 'image/png' } : null,
    } as unknown as IProduct;
  }

  private buildVoiceContext(): VoiceFrontendContext {
    const locale = (isPlatformBrowser(this.platformId) && navigator?.language)
      ? navigator.language
      : 'en-IN';

    return {
      page_url: this.router.url,
      locale,
      active_filters: this.getActiveFilters(),
      selected_product: this.getSelectedProductContext(),
      visible_products: this.getVisibleProductsContext(),
      cart_snapshot: this.getCartSnapshotContext(),
    };
  }

  private getActiveFilters(): Record<string, any> {
    try {
      const tree = this.router.parseUrl(this.router.url);
      return { ...(tree.queryParams || {}) };
    } catch {
      return {};
    }
  }

  private getCartSnapshotContext(): Array<Record<string, any>> {
    const cartItems = this.store.selectSnapshot((s: any) => s.cart?.items || []);
    return cartItems.slice(0, 30).map((item: any) => ({
      product_id: item?.product_id,
      name: item?.product?.name || item?.name || '',
      quantity: item?.quantity || 1,
      price: item?.product?.price || item?.price || 0,
    }));
  }

  private getSelectedProductContext(): Record<string, any> {
    const selected: Record<string, any> = {};

    const selectedFromStore = this.store.selectSnapshot((s: any) => {
      const productState = s?.product || {};
      return productState?.selectedProduct || null;
    });
    if (selectedFromStore) {
      const selectedId = selectedFromStore?.id || selectedFromStore?.productID || selectedFromStore?.product_id;
      const selectedName = selectedFromStore?.name || selectedFromStore?.productName;
      const selectedCategory = selectedFromStore?.category || selectedFromStore?.categoryName || selectedFromStore?.productCategory;
      const selectedPrice = selectedFromStore?.sale_price ?? selectedFromStore?.price ?? selectedFromStore?.sellingPrice;
      if (selectedId != null) selected['id'] = selectedId;
      if (selectedName) selected['name'] = String(selectedName).trim();
      if (selectedCategory) selected['category'] = String(selectedCategory).trim();
      if (selectedPrice != null) selected['price'] = selectedPrice;
    }

    try {
      const tree = this.router.parseUrl(this.router.url);
      const qp = tree.queryParams || {};
      if (qp['productId']) selected['id'] = qp['productId'];
      if (qp['id'] && !selected['id']) selected['id'] = qp['id'];
    } catch {
      // Ignore URL parsing failures
    }

    if (!selected['name'] && isPlatformBrowser(this.platformId)) {
      const nameNode = document.querySelector<HTMLElement>('h1, .product-title, .product_name, .product-name');
      const nameText = (nameNode?.textContent || '').trim();
      if (nameText) selected['name'] = nameText;
    }

    return selected;
  }

  private getVisibleProductsContext(): Array<Record<string, any>> {
    const fromStore = this.store.selectSnapshot((s: any) => {
      const productState = s?.product || {};
      const candidates = [
        productState?.product?.data,
        productState?.productBySearchList,
        productState?.productBySearch,
        productState?.categoryProducts,
        productState?.storeProducts,
        productState?.menuProducts,
        productState?.moreProduct,
      ];
      const merged: any[] = [];
      for (const candidate of candidates) {
        if (Array.isArray(candidate)) merged.push(...candidate);
      }
      return merged;
    });

    if (Array.isArray(fromStore) && fromStore.length) {
      const seen = new Set<string>();
      return fromStore.slice(0, 40).map((product: any) => {
        const ctx: Record<string, any> = {
          name: String(product?.name || product?.productName || '').trim(),
        };
        const id = product?.id || product?.productID || product?.product_id;
        const category = product?.category || product?.categoryName || product?.productCategory;
        const price = product?.sale_price ?? product?.price ?? product?.sellingPrice;
        if (id != null) ctx['id'] = id;
        if (category) ctx['category'] = String(category).trim();
        if (price != null) ctx['price'] = price;
        const key = `${ctx['id'] || ''}|${ctx['name'].toLowerCase()}`;
        if (!ctx['name'] || seen.has(key)) return null;
        seen.add(key);
        return ctx;
      }).filter((p: Record<string, any> | null): p is Record<string, any> => !!p);
    }

    if (!isPlatformBrowser(this.platformId)) return [];

    const selectors = [
      '[data-product-id]',
      '[data-product-name]',
      '.product-box',
      '.product-card',
      '.product-box-contain',
      '.product-wrapper',
      '.product-wrap',
    ];

    const nodes = Array.from(document.querySelectorAll(selectors.join(','))) as HTMLElement[];
    const seen = new Set<string>();
    const products: Array<Record<string, any>> = [];

    for (const node of nodes) {
      const id = node.getAttribute('data-product-id') || node.getAttribute('data-id') || '';
      const attrName = node.getAttribute('data-product-name') || node.getAttribute('data-name') || '';
      const titleNode = node.querySelector<HTMLElement>(
        '.product-name, .title, h2, h3, h4, a[title], [data-product-title]'
      );
      const titleAttr = titleNode?.getAttribute('data-product-title') || titleNode?.getAttribute('title') || '';
      const name = (attrName || titleAttr || titleNode?.textContent || '').trim();
      if (!name || name.length < 2) continue;

      const key = `${id}|${name.toLowerCase()}`;
      if (seen.has(key)) continue;
      seen.add(key);

      const category = (node.getAttribute('data-category') || '').trim();
      const product: Record<string, any> = { name };
      if (id) product['id'] = id;
      if (category) product['category'] = category;
      products.push(product);

      if (products.length >= 40) break;
    }

    return products;
  }

  // ── Voice Recording ─────────────────────────────────────────────────────
  private mediaRecorder: any = null;
  private audioChunks: Blob[] = [];
  private isRecording = false;

  private initSpeech() {
    if (!(window as any).MediaRecorder) {
      console.warn('MediaRecorder not supported');
      return;
    }
  }

  toggleVoice() {
    if (this.isListening) {
      this.stopRecording();
    } else {
      if (!this.isOpen) {
        this.isOpen = true;
        this.checkHealth(false);
      }
      this.startRecording();
    }
  }

  private async startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
          sampleRate: 48000,
          sampleSize: 16,
        }
      });

      const recorderOptions: MediaRecorderOptions = {
        audioBitsPerSecond: 160000,
      };
      const preferredMimeTypes = ['audio/webm;codecs=opus', 'audio/webm'];
      const supportedMimeType = preferredMimeTypes.find(type =>
        typeof MediaRecorder !== 'undefined' &&
        typeof MediaRecorder.isTypeSupported === 'function' &&
        MediaRecorder.isTypeSupported(type)
      );
      if (supportedMimeType) recorderOptions.mimeType = supportedMimeType;

      this.audioChunks = [];
      this.mediaRecorder = new (window as any).MediaRecorder(stream, recorderOptions);

      this.mediaRecorder.ondataavailable = (e: any) => {
        if (e.data.size > 0) {
           this.audioChunks.push(e.data);
        }
      };

      this.mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((t: any) => t.stop());
        await this.sendAudioToServer();
      };

      this.mediaRecorder.start(250);
      this.isListening = true;
      this.inputText = '';
      console.log('Recording started...');

    } catch (err) {
      this.addBot('🎤 Microphone access denied. Please allow microphone permission.');
      this.isListening = false;
    }
  }

  private stopRecording() {
    if (!this.isListening) return;
    this.isListening = false;
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.stop();
    }
  }

  private async sendAudioToServer() {
    if (this.audioChunks.length === 0) return;
    this.zone.run(() => { this.isLoading = true; });
    const frontendContext = this.buildVoiceContext();

    try {
      const mimeType = this.mediaRecorder?.mimeType || 'audio/webm';
      const audioBlob = new Blob(this.audioChunks, { type: mimeType });
      const form = new FormData();
      form.append('audio', audioBlob, 'voice-command.webm');
      form.append('page', this.router.url);
      form.append('context_json', JSON.stringify(frontendContext));

      const transcribeRes = await this.fetchApi('/transcribe', {
        method: 'POST',
        headers: { 'X-Session-ID': this.sessionId },
        body: form,
      }, 20000);

      if (!transcribeRes.ok) throw new Error(`HTTP ${transcribeRes.status}`);
      const transcribeData = await transcribeRes.json();
      if (!transcribeData.text) throw new Error(transcribeData.error || 'Could not understand audio.');

      const data = await this.sendCommandWithFallback(transcribeData.text, frontendContext);

      if (data.session_id) {
        this.sessionId = data.session_id;
        try { localStorage.setItem('va-session-id', this.sessionId); } catch {}
      }

      if (data.text) {
        this.inputText = data.text;
        this.addUser(data.text);
      }

      if (data.message) {
        this.addBot(data.message, data.intent);
        this.speak(data.message);
      } else if (data.error) {
        this.addBot(data.error);
      } else {
        this.addBot('Could not understand audio.');
      }

      if (data.actions?.length) {
        this.runActions(data.actions);
      }

      this.audioChunks = [];
      this.isLoading = false;
    } catch {
      this.audioChunks = [];
      this.isLoading = false;
      this.isOnline = false;
      this.addBot(
        `⚠️ Lost connection to AI service.\n\nPlease try again in a moment.`,
        'ERROR'
      );
    }
  }

  // ── Text-to-Speech (TTS) ─────────────────────────────────────────────
  toggleTTS() {
    this.ttsEnabled = !this.ttsEnabled;
    if (!this.ttsEnabled) this.stopTTS();
  }

  private speak(text: string) {
    if (!this.ttsEnabled || !isPlatformBrowser(this.platformId)) return;
    if (!('speechSynthesis' in window)) return;

    // Don't speak system/error messages
    if (!text || text.includes('⚠️') || text.includes('python server.py')) return;

    // Clean text for speech — remove emojis and formatting
    const cleaned = text
      .replace(/[💎🛒❤️📦🏷️🔀🧭🔍📂🗑️✅🌙☀️⭐🤔💰📄💳🎤]/g, '')
      .replace(/[•·]/g, ',')
      .replace(/\n+/g, '. ')
      .replace(/₹([\d,]+)/g, '$1 rupees')
      .trim();

    if (!cleaned) return;

    this.stopTTS();
    const utterance = new SpeechSynthesisUtterance(cleaned);
    utterance.lang = 'en-IN';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    // Try to use an Indian English voice
    const voices = speechSynthesis.getVoices();
    const indianVoice = voices.find(v => v.lang === 'en-IN') ||
                        voices.find(v => v.lang.startsWith('en'));
    if (indianVoice) utterance.voice = indianVoice;

    utterance.onstart = () => { this.zone.run(() => { this.isSpeaking = true; }); };
    utterance.onend   = () => { this.zone.run(() => { this.isSpeaking = false; }); };
    utterance.onerror = () => { this.zone.run(() => { this.isSpeaking = false; }); };

    speechSynthesis.speak(utterance);
  }

  private stopTTS() {
    if (isPlatformBrowser(this.platformId) && 'speechSynthesis' in window) {
      speechSynthesis.cancel();
      this.isSpeaking = false;
    }
  }

  // ── Utility ──────────────────────────────────────────────────────────────
  get hasSpeech(): boolean {
    if (!isPlatformBrowser(this.platformId)) return false;
    return !!(navigator.mediaDevices && (window as any).MediaRecorder);
  }

  addBot(text: string, intent?: string) {
    this.messages.push({ role: 'bot', text, intent, time: this.now() });
    this.scroll();
    this.saveMessages();
  }

  addUser(text: string) {
    this.messages.push({ role: 'user', text, time: this.now() });
    this.scroll();
    this.saveMessages();
  }

  private scroll() {
    setTimeout(() => {
      const el = document.getElementById('va-messages');
      if (el) el.scrollTop = el.scrollHeight;
    }, 60);
  }

  private now(): string {
    return new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  }

  onEnter(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); this.send(); }
  }

  trackMsg(index: number, msg: ChatMessage): string {
    return `${index}-${msg.time}-${msg.role}`;
  }
}
