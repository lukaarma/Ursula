/* eslint-disable @typescript-eslint/no-unused-vars */
enum MsgAction {
    ADD_DOWNLOAD,
    GET_DOWNLOADS
}

enum DownloadStatus {
    WAITING = 'waiting',
    DOWNLOADING = 'downloading',
    DONE = 'done',
    ERROR = 'error!'
}

type Download = {
    filename: string,
    url: string,
    baseUrl: string,
    size: string,
    status: DownloadStatus,
    progess: number
}


type MsgResponse = {
    ok: boolean,
    queue?: Array<Download>
    error?: string
}
