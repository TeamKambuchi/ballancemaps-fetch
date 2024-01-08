class MapDataFetcher {
  #username = "ballancemaps";
  #indexLink = `http://c6.ysepan.com/f_ht/ajcx/ml.aspx?cz=ml_dq&_dlmc=${this.#username}&_dlmm=`;
  #fileListLink = `http://c6.ysepan.com/f_ht/ajcx/wj.aspx?cz=dq&jsq=0&mlbh={index}&wjpx=1&_dlmc=${this.#username}&_dlmm=`;
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
        htmlString.matchAll(new RegExp(
          '<li[^<>]+id="ml_([0-9]+)"[^<>]*>.*?<a [^<>]*>([^<>]+)</a><label>([^<>]+)?</label>.*?</li>', 'g'
        ))
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
      .then(text => {
        const b64Part = text.substring(text.indexOf("]") + 1);

        // deprecated method (escape)
        // return decodeURIComponent(escape(atob(b64Part)));

        return decodeURIComponent(
          // non-standard impl of base64 converting
          atob(b64Part)
            .split("")
            .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
            .join("")
        );
      })
      .catch((error) => {
        console.error('Error: ', error);
      });
    return (responseString ?? "");
  };
};

function test() {
  const fetcher = new MapDataFetcher();
  fetcher.getGroupIndexes('Ballance自制地图').then(indexes => {
    indexes.forEach((index) => {
      fetcher.getMapList(index.id).then(maps => {
        maps.forEach(map => {
          console.log(JSON.stringify(map));
        });
      });
    });
  })
}

async function testAsync() {
  const fetcher = new MapDataFetcher();
  const indexes = await fetcher.getGroupIndexes('Ballance自制地图');
  for (const index of indexes) {
    const maps = await fetcher.getMapList(index.id);
    for (const map of maps) {
      console.log(JSON.stringify(map));
    }
  }
}

testAsync();
