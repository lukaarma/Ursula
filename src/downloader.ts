const downloadQueue: Array<Download> = [];
let activeDownload = false;
let downloadId: number;
let downloadUrl: string;
const infoRegex = /(https:\/\/videolectures\.unimi\.it\/vod\/mp4:(.*)\/)/;


// FIXME: mutate this to return promises because sendResponse is outdated
function messageHandler(message: any, sender: browser.runtime.MessageSender,
    sendResponse: (response: object) => Promise<void>): void {
    if (message.action !== null || message.action !== undefined) {
        const response: MsgResponse = {
            ok: false
        };

        switch (message.action) {
            case MsgAction.ADD_DOWNLOAD:
                startDownload(message.url) ? response.ok = true : response.error = 'Error extracting video info!';

                break;

            case MsgAction.GET_DOWNLOADS:
                response.ok = true;
                response.queue = downloadQueue;

                break;

            default:
                console.error(`Unsupported action ${message.action}`);
                response.error = 'Unsupported action';

                break;
        }

        sendResponse(response);
    }
    else {
        console.error(`No action from ${sender.tab?.id ?? sender.id}`);
    }
}

function downloadHandler(info: { id: number, state?: browser.downloads.StringDelta }): void {
    if (info.id === downloadId && info.state?.current === 'complete') {
        activeDownload = false;
        download();
    }
}

function startDownload(url: string): boolean {
    const videoInfo = infoRegex.exec(url);

    // FIXME: sanitize filename!!
    if (videoInfo) {
        downloadQueue.push({
            filename: videoInfo[2],
            url,
            baseUrl: videoInfo[1],
            size: 'unknown',
            status: DownloadStatus.WAITING,
            progess: 0
        });

        download();

        return true;
    }

    return false;
}

async function download(): Promise<void> {
    if (!activeDownload && downloadQueue.find(i => i.status === DownloadStatus.WAITING)) {
        activeDownload = true;

        const video = downloadQueue.find(i => i.status === DownloadStatus.WAITING);
        if (video) {
            //TODO: better error handling?
            try {
                video.status = DownloadStatus.DOWNLOADING;

                const videoParts: Array<BlobPart> = [];
                const manifest = await fetch(video.url);
                const chunklistUrl = (await manifest.text()).split('\n').find(line => !line.startsWith('#'));
                console.debug(chunklistUrl);
                const chunklist = await fetch(video.baseUrl + chunklistUrl);

                const segments = (await chunklist.text()).split('\n').reduce((final: Array<string>, line) => {
                    if (!line.startsWith('#') && line !== '') {
                        final.push(video.baseUrl + line);
                    }

                    return final;
                }, []);

                console.debug(segments);

                for (const [index, segUrl] of segments.entries()) {
                    video.progess = ((index / segments.length) * 100);
                    videoParts.push(await (await fetch(segUrl)).arrayBuffer());
                }


                downloadUrl = URL.createObjectURL(new Blob(videoParts, {type : 'video/mp4'}));                downloadId = await browser.downloads.download({
                    url: downloadUrl,
                    filename: video.filename
                });

                video.status = DownloadStatus.DONE;
                video.progess = 100;
            }
            catch (err) {
                video.status = DownloadStatus.ERROR;
            }
        }
    }
    else {
        console.debug('No video to download!');
    }
}


browser.runtime.onMessage.addListener(messageHandler);
browser.downloads.onChanged.addListener(downloadHandler);
