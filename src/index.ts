import { Env } from './env';

// Cloudflare Workers 타입 정의
interface ScheduledEvent {
  cron: string;
  type: 'scheduled';
  scheduledTime: number;
}

interface ExecutionContext {
  waitUntil(promise: Promise<any>): void;
  passThroughOnException(): void;
}

// 타입 정의
interface CheckResponseData {
  result: Record<string, string>;
}

interface PostsData {
  items: ItemsData[];
}

interface ItemsData {
  created_at: number;
  media: MediaData[];
  type: string;
}

interface MediaData {
  type: string;
  large_url: string;
}

interface SearchTarget {
  [name: string]: string;
}

// 작업 완료 여부 체크 함수
async function checkWorkDone(searchTarget: SearchTarget): Promise<boolean> {
  try {
    const response = await fetch("https://lunch.muz.kr?check=true", {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: CheckResponseData = await response.json();

    // searchTarget의 모든 키가 result에 존재하고 빈 문자열이 아닌지 확인
    for (const name of Object.keys(searchTarget)) {
      const url = data.result[name];
      if (!url || url === "") {
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error("Error checking work done:", error);
    return false;
  }
}

// 이미지 URL 가져오기 함수
async function getImage(key: string): Promise<string> {
  try {
    const url = `https://pf.kakao.com/rocket-web/web/profiles/${key}/posts`;
    console.log(`Fetching image from: ${url}`);

    const response = await fetch(url, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: PostsData = await response.json();

    if (!data.items || data.items.length === 0) {
      throw new Error("No items found");
    }

    // 서울 시간 기준으로 오늘 자정의 타임스탬프 계산
    const now = new Date();
    const seoulTime = new Date(now.getTime() + (9 * 60 * 60 * 1000)); // UTC+9
    const todayMidnight = new Date(
      seoulTime.getFullYear(),
      seoulTime.getMonth(),
      seoulTime.getDate(),
      0,
      0,
      0,
      0
    ).getTime();

    // 오늘 작성된 이미지 포스트만 필터링
    let todayMedia: MediaData[] = [];
    for (const item of data.items) {
      if (item.created_at >= todayMidnight && item.type === "image") {
        todayMedia = item.media;
        break;
      }
    }

    if (todayMedia.length === 0) {
      throw new Error("No image found for today");
    }

    // 키에 따라 다른 이미지 선택 로직
    if (key === "_FxbaQC") {
      // 삼촌밥차 - 마지막 이미지
      return todayMedia[todayMedia.length - 1].large_url;
    } else if (key === "_CiVis") {
      // 슈마우스 - 첫 번째 이미지
      return todayMedia[0].large_url;
    } else if (key === "_vKxgdn") {
      // 정담 - 첫 번째 이미지
      return todayMedia[0].large_url;
    }

    throw new Error("Unknown key");
  } catch (error) {
    console.error(`Error getting image for key ${key}:`, error);
    return "";
  }
}

// 모든 이미지를 병렬로 가져오기
async function fetchAllImages(searchTarget: SearchTarget): Promise<Record<string, string>> {
  const promises = Object.entries(searchTarget).map(async ([name, key]) => {
    const imageUrl = await getImage(key);
    return { name, imageUrl };
  });

  const results = await Promise.all(promises);
  
  const data: Record<string, string> = {};
  for (const { name, imageUrl } of results) {
    data[name] = imageUrl;
  }

  return data;
}

// 이미지 업로드 함수
async function uploadImage(data: Record<string, string>): Promise<void> {
  try {
    const response = await fetch("https://lunch.muz.kr", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    console.log("Images uploaded successfully");
  } catch (error) {
    console.error("Failed to upload images:", error);
    throw error;
  }
}

// 메인 워커 함수
async function handleScheduledEvent(): Promise<void> {
  const searchTarget: SearchTarget = {
    uncle: "_FxbaQC",   // 삼촌밥차
    mouse: "_CiVis",    // 슈마우스
    jundam: "_vKxgdn",  // 정담
  };

  try {
    // 작업 완료 여부 체크
    const isWorkDone = await checkWorkDone(searchTarget);
    if (isWorkDone) {
      console.log("Work already done for today");
      return;
    }

    // 모든 이미지 가져오기
    const imageData = await fetchAllImages(searchTarget);

    if (Object.keys(imageData).length === 0) {
      console.error("No images found");
      return;
    }

    // 유효한 이미지 URL이 있는지 확인
    const hasValidImages = Object.values(imageData).some(url => url !== "");
    
    if (hasValidImages) {
      // 로그 출력
      for (const [key, value] of Object.entries(imageData)) {
        console.log(`${key}: ${value}`);
      }

      // 이미지 업로드
      await uploadImage(imageData);
      console.log("Images uploaded successfully");
    } else {
      console.error("No valid images found");
    }
  } catch (error) {
    console.error("Error in scheduled event:", error);
  }
}

// Cloudflare Workers 이벤트 핸들러
export default {
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    console.log("Scheduled event triggered at:", new Date().toISOString());
    await handleScheduledEvent();
  },

  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // 수동 트리거를 위한 HTTP 엔드포인트
    if (request.method === "POST" && new URL(request.url).pathname === "/trigger") {
      try {
        await handleScheduledEvent();
        return new Response("Manual trigger completed", { status: 200 });
      } catch (error) {
        return new Response(`Error: ${error}`, { status: 500 });
      }
    }

    return new Response("Lunch Menu Scraper Worker", {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  },
};
