class MapDataFetcher {
  #username = "ballancemaps";
  #indexLink = `http://cc.ysepan.com/f_ht/ajcx/ml.aspx?cz=ml_dq&_dlmc=${this.#username}&_dlmm=`;
  #fileListLink = `http://cc.ysepan.com/f_ht/ajcx/wj.aspx?cz=dq&jsq=0&mlbh={index}&wjpx=1&_dlmc=${this.#username}&_dlmm=`;
  #indexes = [];
  #mapList = {};


  refresh() {
    this.#indexes = [];
    this.#mapList = {};
  };


  async getGroupIndexes(patternString) {
    if (this.#indexes.length == 0) {
      const htmlString = await this.#getYsHtml(this.#indexLink);
      this.#indexes = Array.from(
        htmlString.matchAll(new RegExp('<li[^<>]+id="ml_([0-9]+)"[^<>]*>.*?<a [^<>]*>([^<>]+)</a><label>([^<>]+)?</label>.*?</li>', "g"))
      ).map(matches => ({
        id: matches[1], 
        name: matches[2],
        notes: (matches[3] ?? "")
      }));
    };
    const groupPattern = new RegExp(patternString);
    let matchedIndexes = [];
    this.#indexes.forEach(index => {
      if (groupPattern.test(index.name))
        matchedIndexes.push(index);
    });
    return matchedIndexes;
  };


  async getMapList(index) {
    if ((this.#mapList[index] ?? []).length == 0) {
      const htmlString = await this.#getYsHtml(this.#fileListLink.replace("{index}", index));
      this.#mapList[index] = Array.from(
        htmlString.matchAll(/<li(?:[^<>]+)>.*?<a[^<>]+?href="([^">]+)"(?:[^<>]+)?>([^<>]+)<\/a><i>([^<]+)<\/i><b>\s*([^\s|<>]+(?:\s+[^\s|<>]+)*)?\s*\|?\s*([^\s|<>]+(?:\s+[^\s|<>]+)*)?\s*\|?\s*([^\s|<>]+(?:\s+[^\s|<>]+)*)?\s*<\/b><span(?:[^<>]+)>([^<>]+)<\/span>.*?<\/a><\/li>/g)
      ).map(matches => ({
        name: matches[2],
        url: matches[1],
        size: matches[3],
        author: (matches[4] ?? ""),
        difficulty: difficultyToNumber(matches[5]),
        notes: (matches[6] ?? ""),
        uploadTime: matches[7]
      }));
    };
    return this.#mapList[index];

    function difficultyToNumber(difficulty) {
      switch (difficulty) {
        case '★': return 1;
        case '★★': return 2;
        case '★★★': return 3;
        case '★★★★': return 4;
        case '★★★★★': return 5;
      };
      return -1;
    };
  };


  async #getYsHtml(url) {
    let responseString = await fetch(url, {
      method: 'GET',
      referrer: 'http://cg.ys168.com/f_ht/ajcx/000ht.html?bbh=1134',
    })
    .then(response => response.text())
    .then(text => text.substring(text.indexOf("<")))
    .catch((error) => {
      console.error('Error: ', error);
    });
    return (responseString ?? "");
  };
};