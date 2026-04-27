import { Page, Locator, expect } from '@playwright/test';
import { DELAYS, TIMEOUTS } from './Utils';

/**
 * Video statistics interface
 */
interface VideoStats {
  totalVideos: number;
  playButtonVideos: number;
  inlineVideos: number;
  failedVideos: number;
}

export class Home {
  private page: Page;

  private searchIcon: Locator;
  private searchInput: Locator;

  private homeLogo: Locator;
  private areaHeader: Locator;
  private areaKV: Locator;
  private areaFooter: Locator;

  constructor(page: Page) {
    this.page = page;

    this.searchIcon = page.locator('button[an-ac="gnb"][an-la="search"]:visible');
    this.searchInput = page.locator('input[type="text"][placeholder*="search"], input[type="text"][name*="search"], input[type="text"][id*="search"], input[type="text"][class*="search"], input[type="text"][aria-label*="search"]');
    this.homeLogo = page.locator('.nv00-gnb-v4__header .nv00-gnb-v4__logo');
    this.areaHeader = page.locator('app-header-v3, nav.nv00-gnb-v4');
    this.areaKV = page.locator('div.ho-g-home-kv-carousel, #ccKvCarousel, .hd08-hero-kv-home');
    this.areaFooter = page.locator('//footer');
  }

  getHomeUrl(baseUrl: string, siteCode: string): string {
    const base = baseUrl.replace(/\/$/, '');
    const code = siteCode ? siteCode.replace(/^\/+|\/+$/g, '') : '';
    return code ? `${base}/${code}/` : `${base}/`;
  }

  async clickSearchIcon(): Promise<void> {
    try {
      await this.searchIcon.first().waitFor({ state: 'visible', timeout: 10000 });
      await this.searchIcon.first().click();
      await this.searchInput.first().waitFor({ state: 'visible', timeout: 5000 });

    } catch (error) {
      console.error('Failed to click search icon:', error);
      throw new Error(`Search icon click failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async enterSearchText(searchText: string): Promise<void> {
    try {
      if (!searchText || searchText.trim() === '') {
        throw new Error('Search text cannot be empty');
      }

      await this.searchInput.first().waitFor({ state: 'visible', timeout: 10000 });
      await this.searchInput.first().clear();
      await this.searchInput.first().fill(searchText);

      const actualValue = await this.searchInput.first().inputValue();
      if (actualValue !== searchText) {
        throw new Error(`Text input verification failed. Expected: "${searchText}", Actual: "${actualValue}"`);
      }

    } catch (error) {
      console.error('Failed to enter search text:', error);
      throw new Error(`Search text input failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async isSearchResultsVisible(searchText: string): Promise<boolean> {
    try {
      const locator = this.page.locator(`div.aisearch-product__sku:has-text("${searchText}")`).first();
      await locator.waitFor({ state: 'visible', timeout: 5000 });
      return await locator.isVisible();
    } catch {
      return false;
    }
  }

  /**
   * Collect all <a> tag href attributes and return only absolute URLs starting with http
   */
  async collectHttpLinks(): Promise<string[]> {
    try {
      const links = await this.page.evaluate(() => {
        return Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href]'))
          .map(a => a.href)
          .filter(href => href.startsWith('http'));
      });

      console.log(`Total HTTP links collected: ${links.length}`);
      return links;
    } catch (error) {
      console.error('Error occurred while collecting links:', error);
      throw new Error(
        `Link collection failed: ${error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }


  /**
   * Request multiple URLs in parallel and return HTTP response codes as a map
 */
  async checkLinksStatus(urls: string[]): Promise<Map<string, string | number>> {
    const results = new Map<string, string | number>();

    try {
      const promises = urls.map(async (url) => {
        try {
          const response = await this.page.request.get(url, {
            timeout: 10000,
            ignoreHTTPSErrors: true
          });
          return { url, status: response.status() };
        } catch (error) {
          return {
            url,
            status: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      });

      const responses = await Promise.all(promises);

      responses.forEach(({ url, status }) => {
        results.set(url, status);
      });

      return results;
    } catch (error) {
      console.error('Error occurred while checking link status:', error);
      throw new Error(`Link status check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Summarize link check results and display failed links as warning logs
   */
  async summarizeLinkResults(results: Map<string, string | number>): Promise<{ success: number; failed: number; total: number }> {
    let successCount = 0;
    let failedCount = 0;
    const failedLinks: string[] = [];

    const failedLinksWithStatus: Array<{url: string, status: string | number}> = [];

    results.forEach((status, url) => {
      if (typeof status === 'number' && status === 200) {
        successCount++;
      } else {
        failedCount++;
        failedLinks.push(url);
        failedLinksWithStatus.push({url, status});
      }
    });

    const total = results.size;

    console.log('\n=== Link Check Results Summary ===');
    console.log(`📊 Total links: ${total}`);
    console.log(`✅ Success (200): ${successCount}`);
    console.log(`❌ Failed: ${failedCount}`);
    console.log(`📈 Success rate: ${total > 0 ? ((successCount / total) * 100).toFixed(2) : 0}%`);

    if (failedLinks.length > 0) {
      console.log('\n=== Failed Links List ===');
      failedLinksWithStatus.forEach((item, index) => {
        console.log(`${index + 1}. ${item.url} - Status: ${item.status}`);
      });
    }

    return { success: successCount, failed: failedCount, total };
  }


  /**
   * Load carousels and check videos in each slide
   */
  async loadCarouselAndCheckVideos(): Promise<VideoStats> {
    const stats: VideoStats = {
      totalVideos: 0,
      playButtonVideos: 0,
      inlineVideos: 0,
      failedVideos: 0
    };

    try {
      const swiperCount = await this.getSwiperCount();
      console.log(`\nTotal swiper count: ${swiperCount}`);

      for (let i = 0; i < swiperCount; i++) {
        console.log(`\n[Swiper #${i}]`);

        const validSlides = await this.getValidSlideCount(i);
        console.log(`  Valid slide count: ${validSlides}`);

        await this.initializeSwiper(i);
        await this.page.waitForTimeout(1000);

        for (let j = 0; j < validSlides; j++) {
          console.log(`  [Slide #${j}]`);

          const moved = await this.moveToSlide(i, j);
          if (!moved) {
            console.log(`    └─ Failed to move to slide #${i},${j}`);
            continue;
          }

          await this.page.waitForTimeout(500);

          const videoInfo = await this.getVideoInfoFromSlide(i);
          if (!videoInfo || !videoInfo.hasVideo) {
            console.log(`    └─ No video found in this slide`);
            continue;
          }

          if (videoInfo.hasPlayButton) {
            await this.checkPlayButtonAndVideoInSlide(stats, i, j);
          } else {
            await this.checkInlineVideosInSlide(stats, i, j);
          }
        }
      }

      console.log(`\nAll carousel slides checked`);
      return stats;
    } catch (error) {
      console.error('Error in loadCarouselAndCheckVideos:', error);
      throw error;
    }
  }

  /**
   * Check video auto-play functionality by scrolling through the page
   */
  async checkVideoAutoPlay(): Promise<void> {
    try {
      // Scroll to top
      await this.page.evaluate(() => window.scrollTo(0, 0));
      await this.page.waitForTimeout(1000);

      const scrollStep = 700;
      let currentScroll = 0;
      let maxHeight = await this.page.evaluate(() => document.body.scrollHeight);

      // Scroll through the entire page
      while (currentScroll < maxHeight) {
        await this.page.evaluate((step) => window.scrollBy(0, step), scrollStep);
        await this.page.waitForTimeout(1000);
        currentScroll += scrollStep;
        maxHeight = await this.page.evaluate(() => document.body.scrollHeight);
      }

      // Find all visible videos
      const videos = await this.page.locator('video:visible').all();
      console.log(`Found ${videos.length} videos`);

      if (videos.length === 0) {
        console.error('Not found video on homepage.');
        return;
      }

      for (const video of videos) {
        await video.scrollIntoViewIfNeeded();
        await this.page.waitForTimeout(1000);

        const loopAttr = await video.getAttribute('loop');
        if (!loopAttr) {
          console.log('No class "loop", skip');
          continue;
        }

        const isAutoPlaying = await this.page.evaluate((videoElement) => {
          if (!videoElement || videoElement.tagName !== 'VIDEO') return false;
          const video = videoElement as HTMLVideoElement;
          return video.currentTime > 0 && !video.paused && !video.ended && video.readyState > 2;
        }, await video.elementHandle());

        if (!isAutoPlaying) {
          console.error('Video is not auto play');
        } else {
          console.log('Video is auto played');
        }
      }
    } catch (error) {
      console.error('Error in checkVideoAutoPlay:', error);
      throw error;
    }
  }
  /**
   * Get video information from a slide
   */
  private async getVideoInfoFromSlide(swiperIndex: number): Promise<{ hasVideo: boolean; hasPlayButton: boolean } | null> {
    try {
      const swiper = this.page.locator(`.swiper:nth-child(${swiperIndex + 1})`);
      const hasVideo = await swiper.locator('video').count() > 0;
      const hasPlayButton = await swiper.locator('.play-button, .video-play-button, [class*="play"]').count() > 0;

      return { hasVideo, hasPlayButton };
    } catch {
      return null;
    }
  }

  /**
   * Check play button and video in a slide
   */
  private async checkPlayButtonAndVideoInSlide(stats: VideoStats, swiperIndex: number, slideIndex: number): Promise<void> {
    try {
      const swiper = this.page.locator(`.swiper:nth-child(${swiperIndex + 1})`);
      const playButton = swiper.locator('.play-button, .video-play-button, [class*="play"]').first();

      if (await playButton.isVisible()) {
        await playButton.click();
        await this.page.waitForTimeout(1000);

        const video = swiper.locator('video').first();
        if (await video.isVisible()) {
          stats.playButtonVideos++;
          stats.totalVideos++;
          console.log(`    └─ Play button video found and clicked`);
        } else {
          stats.failedVideos++;
          console.log(`    └─ Play button clicked but no video found`);
        }
      }
    } catch (error) {
      stats.failedVideos++;
      console.log(`    └─ Error checking play button video: ${error}`);
    }
  }

  /**
   * Check inline videos in a slide
   */
  private async checkInlineVideosInSlide(stats: VideoStats, swiperIndex: number, slideIndex: number): Promise<void> {
    try {
      const swiper = this.page.locator(`.swiper:nth-child(${swiperIndex + 1})`);
      const videos = swiper.locator('video');
      const videoCount = await videos.count();

      if (videoCount > 0) {
        stats.inlineVideos += videoCount;
        stats.totalVideos += videoCount;
        console.log(`    └─ Found ${videoCount} inline video(s)`);
      }
    } catch (error) {
      stats.failedVideos++;
      console.log(`    └─ Error checking inline videos: ${error}`);
    }
  }


  async clickHomeLogo(): Promise<void> {
    try {
      await this.homeLogo.waitFor({ state: 'visible', timeout: TIMEOUTS.STANDARD });
      await this.homeLogo.click();
    } catch (error) {
      console.error('Failed to click home logo:', error);
      throw new Error(`Home logo click failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async verifyAreaHeader(): Promise<void> {
    await expect(this.areaHeader).toBeVisible({ timeout: TIMEOUTS.STANDARD });
    await expect(this.areaHeader).not.toBeEmpty();
  }

  async verifyAreaKV(): Promise<void> {
    await expect(this.areaKV).toBeVisible({ timeout: TIMEOUTS.STANDARD });
    await expect(this.areaKV).not.toBeEmpty();
  }

  async verifyAreaFooter(): Promise<void> {
    await expect(this.areaFooter).toBeVisible({ timeout: TIMEOUTS.STANDARD });
    await expect(this.areaFooter).not.toBeEmpty();
  }

  // Verify all home areas at once
  async verifyAllHomeAreas(): Promise<void> {
    await this.verifyAreaHeader();
    await this.verifyAreaKV();
    await this.verifyAreaFooter();
  }

  /**
   * Change all lazy loading images to eager loading to ensure fast loading
   */
  async setImageLoadOption(): Promise<void> {
    try {
      const changedCount = await this.page.evaluate(() => {
        const lazyImages = document.querySelectorAll('img[loading="lazy"]');
        lazyImages.forEach(img => {
          img.setAttribute('loading', 'eager');
        });
        return lazyImages.length;
      });

      if (changedCount > 0) {
        console.log(`✓ Image loading option set to eager for ${changedCount} lazy images`);
      } else {
        console.log('✓ No lazy loading images found to convert');
      }
    } catch (error) {
      console.error('Failed to set image loading option:', error);
      throw new Error(`Image loading option setting failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Swiper constants
  private readonly SWIPER_SELECTOR_ALL = '.swiper-container';
  private readonly SWIPER_SELECTOR_VIDEO = '.swiper-container:not(.my-recommended-product__card-swiper):not(.half-teaser-list__content), .swiper-initialized:not(.cpcs-esis_product_listing_swiper)';
  private readonly VALID_SLIDE_SELECTOR = '.swiper-slide:not(.swiper-slide-duplicate)';
  private readonly SWIPER_SELECTOR_RECOMMENDED = '.swiper-container.my-recommended-product__card-swiper';

  /** Returns the number of swiper containers */
  private async getSwiperCount(): Promise<number> {
    return await this.page.locator(this.SWIPER_SELECTOR_VIDEO).count();
  }

  /** Returns the number of valid slides in a swiper */
  private async getValidSlideCount(swiperIndex: number): Promise<number> {
    const swiper = this.page.locator(this.SWIPER_SELECTOR_VIDEO).nth(swiperIndex);
    return await swiper.locator(this.VALID_SLIDE_SELECTOR).count();
  }

  /** Resets a swiper to the first slide */
  private async initializeSwiper(swiperIndex: number): Promise<void> {
    await this.page.evaluate((args) => {
      const [selector, index] = args;
      const swiper = document.querySelectorAll(selector as string)[index as number];
      if (swiper && (swiper as any).swiper) {
        (swiper as any).swiper.update();
        (swiper as any).swiper.slideTo(0, 0);
      }
    }, [this.SWIPER_SELECTOR_VIDEO, swiperIndex]);
  }

  /** Navigates to a specific slide */
  private async moveToSlide(swiperIndex: number, slideIndex: number): Promise<boolean> {
    try {
      const swiperElement = this.page.locator(this.SWIPER_SELECTOR_VIDEO).nth(swiperIndex);
      await swiperElement.scrollIntoViewIfNeeded();

      await this.page.evaluate((args) => {
        const [selector, swiperIdx, slideIdx] = args;
        const swiper = document.querySelectorAll(selector as string)[swiperIdx as number];
        if (swiper && (swiper as any).swiper) {
          (swiper as any).swiper.slideToLoop(slideIdx as number);
        }
      }, [this.SWIPER_SELECTOR_VIDEO, swiperIndex, slideIndex]);

      await this.page.waitForTimeout(500);
      return true;
    } catch (error) {
      console.error('Failed to move to slide:', error);
      return false;
    }
  }

  /** Checks for broken images on the page */
  private async checkBrokenImages(): Promise<void> {
    const images = this.page.locator('img[src]');
    const imageCount = await images.count();

    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);

      if (await img.isVisible()) {
        const isBroken = await img.evaluate((el: HTMLImageElement) => {
          const style = window.getComputedStyle(el);
          return style.display !== 'none' &&
            style.visibility !== 'hidden' &&
            parseFloat(style.opacity) > 0 &&
            el.naturalWidth === 0;
        });

        if (isBroken) {
          const src = await img.getAttribute('src');
          const desktopSrc = await img.getAttribute('data-desktop-src');
          console.error(`❌ Broken image found - src: ${src}, desktop-src: ${desktopSrc}`);
          throw new Error(`Broken image detected: ${src}`);
        }
      }
    }
  }

  /** Returns the number of recommended product card swipers */
  private async getRecommendedCardCount(): Promise<number> {
    return await this.page.locator(this.SWIPER_SELECTOR_RECOMMENDED).count();
  }

  /** Returns the number of valid slides in a recommended product swiper */
  private async getValidRecommendedCard(swiperIndex: number): Promise<number> {
    const swiper = this.page.locator(this.SWIPER_SELECTOR_RECOMMENDED).nth(swiperIndex);
    return await swiper.locator(this.VALID_SLIDE_SELECTOR).count();
  }

  /** Resets a recommended product swiper to the first slide */
  private async initializeSwiperRecommendedSection(swiperIndex: number): Promise<void> {
    await this.page.evaluate((args) => {
      const [selector, index] = args;
      const swiper = document.querySelectorAll(selector as string)[index as number];
      if (swiper && (swiper as any).swiper) {
        (swiper as any).swiper.update();
        (swiper as any).swiper.slideTo(0, 0);
      }
    }, [this.SWIPER_SELECTOR_RECOMMENDED, swiperIndex]);
  }

  /** Navigates to a specific slide in a recommended product swiper */
  private async moveToRecommendedProductSection(swiperIndex: number, slideIndex: number): Promise<boolean> {
    try {
      const swiperElement = this.page.locator(this.SWIPER_SELECTOR_RECOMMENDED).nth(swiperIndex);
      await swiperElement.scrollIntoViewIfNeeded();

      await this.page.evaluate((args) => {
        const [selector, swiperIdx, slideIdx] = args;
        const swiper = document.querySelectorAll(selector as string)[swiperIdx as number];
        if (swiper && (swiper as any).swiper) {
          (swiper as any).swiper.slideToLoop(slideIdx as number);
        }
      }, [this.SWIPER_SELECTOR_RECOMMENDED, swiperIndex, slideIndex]);

      await this.page.waitForTimeout(500);
      return true;
    } catch (error) {
      console.error('Failed to move to recommended product section:', error);
      return false;
    }
  }

  /** Checks all carousel images (swipers and recommended product sections) */
  async loadCarouselAndCheckImages(): Promise<void> {
    // Check swiper sections
    const swiperCount = await this.getSwiperCount();
    console.log(`\nTotal swiper count video: ${swiperCount}`);

    for (let i = 0; i < swiperCount; i++) {
      console.log(`\n[Swiper #${i}]`);

      const validSlides = await this.getValidSlideCount(i);
      console.log(`  Valid slide count: ${validSlides}`);

      await this.initializeSwiper(i);
      await this.page.waitForTimeout(1000);

      for (let j = 0; j < validSlides; j++) {
        console.log(`  [Slide #${j}]`);

        if (!(await this.moveToSlide(i, j))) {
          console.log(`    └─ Failed to move to slide #${i},${j}`);
          continue;
        }

        await this.checkBrokenImages();
      }
    }

    // Check recommended product sections
    const cardCount = await this.getRecommendedCardCount();
    if (cardCount === 0) {
      console.log('Recommended product is not configured');
      return;
    }

    for (let i = 0; i < cardCount; i++) {
      console.log(`\n[Card #${i}]`);

      const recommendedCard = await this.getValidRecommendedCard(i);
      console.log(`Total recommended product: ${recommendedCard}`);

      await this.initializeSwiperRecommendedSection(i);
      await this.page.waitForTimeout(1000);

      for (let j = 0; j < recommendedCard; j++) {
        console.log(`  [Product: #${j}]`);

        if (!(await this.moveToRecommendedProductSection(i, j))) {
          console.log(`    └─ Failed to move to recommended product section #${i},${j}`);
          continue;
        }

        await this.checkBrokenImages();

        const nextButton = this.page.locator('button.swiper-button-next').first();
        if (await nextButton.isVisible()) {
          await nextButton.click();

          const isDisabled = await nextButton.evaluate(el =>
            el.classList.contains('swiper-button-disabled')
          );

          if (isDisabled) {
            break;
          }
        }
      }
    }

    console.log('\n✓ All carousel and image checks completed');
  }
}