declare module 'rss' {
  export default class RSS {
    constructor(options: {
      title: string;
      description: string;
      feed_url: string;
      site_url: string;
      language?: string;
      pubDate?: Date;
    });

    item(options: {
      title: string;
      description: string;
      url: string;
      date: Date;
    }): this;

    xml(): string;
  }
}
