export interface CountsData {
  total: number;
  byOffice: Record<string, number>;
}

export class LiveVisitorCounter {
  state: DurableObjectState;
  sessions: WebSocket[] = [];
  counts: CountsData = { total: 0, byOffice: {} };

  constructor(state: DurableObjectState) {
    this.state = state;
    this.state.blockConcurrencyWhile(async () => {
      this.counts = (await this.state.storage.get<CountsData>('counts')) || { total: 0, byOffice: {} };
    });
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/websocket') {
      const pair = new WebSocketPair();
      this.sessions.push(pair[1]);
      pair[1].accept();
      pair[1].send(JSON.stringify({ type: 'counts', value: this.counts }));
      return new Response(null, { status: 101, webSocket: pair[0] });
    }

    if (url.pathname === '/checkin') {
      const office = url.searchParams.get('office') || 'unknown';
      this.counts.total++;
      this.counts.byOffice[office] = (this.counts.byOffice[office] || 0) + 1;
      await this.state.storage.put('counts', this.counts);
      this.broadcast({ type: 'counts', value: this.counts });
      return new Response(JSON.stringify(this.counts));
    }

    if (url.pathname === '/checkout') {
      const office = url.searchParams.get('office') || 'unknown';
      this.counts.total = Math.max(0, this.counts.total - 1);
      if (this.counts.byOffice[office]) {
        this.counts.byOffice[office] = Math.max(0, this.counts.byOffice[office] - 1);
      }
      await this.state.storage.put('counts', this.counts);
      this.broadcast({ type: 'counts', value: this.counts });
      return new Response(JSON.stringify(this.counts));
    }

    if (url.pathname === '/reset') {
      this.counts = { total: 0, byOffice: {} };
      await this.state.storage.put('counts', this.counts);
      this.broadcast({ type: 'counts', value: this.counts });
      return new Response(JSON.stringify(this.counts));
    }

    if (url.pathname === '/counts') {
      return new Response(JSON.stringify(this.counts));
    }

    return new Response('Not found', { status: 404 });
  }

  broadcast(data: any) {
    const msg = JSON.stringify(data);
    this.sessions = this.sessions.filter(ws => {
      try {
        ws.send(msg);
        return true;
      } catch {
        return false;
      }
    });
  }
}
