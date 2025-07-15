/**
 * 絵文字変換ライブラリ
 * 
 * @description 旧システム互換の絵文字変換機能を提供
 */

// 基本的な絵文字マッピング（旧システムで対応していたもの）
const emojiMap: Record<string, string> = {
  ':smile:': '😄',
  ':grinning:': '😀',
  ':smiley:': '😃',
  ':blush:': '😊',
  ':relaxed:': '☺️',
  ':wink:': '😉',
  ':heart_eyes:': '😍',
  ':kissing_heart:': '😘',
  ':kissing:': '😗',
  ':kissing_smiling_eyes:': '😙',
  ':stuck_out_tongue_winking_eye:': '😜',
  ':stuck_out_tongue_closed_eyes:': '😝',
  ':stuck_out_tongue:': '😛',
  ':flushed:': '😳',
  ':worried:': '😟',
  ':angry:': '😠',
  ':rage:': '😡',
  ':cry:': '😢',
  ':persevere:': '😣',
  ':triumph:': '😤',
  ':disappointed_relieved:': '😥',
  ':fearful:': '😨',
  ':weary:': '😩',
  ':sleepy:': '😪',
  ':tired_face:': '😫',
  ':sob:': '😭',
  ':cold_sweat:': '😰',
  ':sweat_smile:': '😅',
  ':sweat:': '😓',
  ':unamused:': '😒',
  ':disappointed:': '😞',
  ':confounded:': '😖',
  ':fearful:': '😨',
  ':cold_sweat:': '😰',
  ':persevere:': '😣',
  ':cry:': '😢',
  ':sob:': '😭',
  ':joy:': '😂',
  ':astonished:': '😲',
  ':scream:': '😱',

  // ハート系
  ':heart:': '❤️',
  ':yellow_heart:': '💛',
  ':green_heart:': '💚',
  ':blue_heart:': '💙',
  ':purple_heart:': '💜',
  ':black_heart:': '🖤',
  ':white_heart:': '🤍',
  ':orange_heart:': '🧡',
  ':brown_heart:': '🤎',
  ':broken_heart:': '💔',
  ':heart_exclamation:': '❣️',
  ':two_hearts:': '💕',
  ':revolving_hearts:': '💞',
  ':heartbeat:': '💓',
  ':heartpulse:': '💗',
  ':sparkling_heart:': '💖',
  ':cupid:': '💘',
  ':gift_heart:': '💝',
  ':heart_decoration:': '💟',

  // 手・指系
  ':thumbsup:': '👍',
  ':thumbsdown:': '👎',
  ':ok_hand:': '👌',
  ':punch:': '👊',
  ':fist:': '✊',
  ':v:': '✌️',
  ':wave:': '👋',
  ':hand:': '✋',
  ':raised_hand:': '✋',
  ':open_hands:': '👐',
  ':point_up:': '☝️',
  ':point_down:': '👇',
  ':point_left:': '👈',
  ':point_right:': '👉',
  ':raised_hands:': '🙌',
  ':pray:': '🙏',
  ':clap:': '👏',
  ':muscle:': '💪',

  // 記号系
  ':star:': '⭐',
  ':star2:': '🌟',
  ':dizzy:': '💫',
  ':boom:': '💥',
  ':fire:': '🔥',
  ':sparkles:': '✨',
  ':sun:': '☀️',
  ':partly_sunny:': '⛅',
  ':cloud:': '☁️',
  ':zap:': '⚡',
  ':umbrella:': '☔',
  ':snowflake:': '❄️',
  ':snowman:': '☃️',
  ':cyclone:': '🌀',
  ':foggy:': '🌁',
  ':ocean:': '🌊',

  // 動物系
  ':cat:': '🐱',
  ':dog:': '🐶',
  ':mouse:': '🐭',
  ':hamster:': '🐹',
  ':rabbit:': '🐰',
  ':fox:': '🦊',
  ':bear:': '🐻',
  ':panda:': '🐼',
  ':koala:': '🐨',
  ':tiger:': '🐯',
  ':lion:': '🦁',
  ':cow:': '🐮',
  ':pig:': '🐷',
  ':frog:': '🐸',
  ':monkey:': '🐵',
  ':chicken:': '🐔',
  ':penguin:': '🐧',
  ':bird:': '🐦',

  // 食べ物系
  ':apple:': '🍎',
  ':orange:': '🍊',
  ':lemon:': '🍋',
  ':banana:': '🍌',
  ':watermelon:': '🍉',
  ':grapes:': '🍇',
  ':strawberry:': '🍓',
  ':peach:': '🍑',
  ':cherries:': '🍒',
  ':pineapple:': '🍍',
  ':tomato:': '🍅',
  ':eggplant:': '🍆',
  ':corn:': '🌽',
  ':bread:': '🍞',
  ':cheese:': '🧀',
  ':meat_on_bone:': '🍖',
  ':poultry_leg:': '🍗',
  ':hamburger:': '🍔',
  ':fries:': '🍟',
  ':pizza:': '🍕',
  ':hotdog:': '🌭',
  ':taco:': '🌮',
  ':burrito:': '🌯',
  ':ramen:': '🍜',
  ':spaghetti:': '🍝',
  ':curry:': '🍛',
  ':rice_ball:': '🍙',
  ':rice:': '🍚',
  ':rice_cracker:': '🍘',
  ':fish_cake:': '🍥',
  ':sushi:': '🍣',
  ':bento:': '🍱',
  ':stew:': '🍲',
  ':oden:': '🍢',
  ':dango:': '🍡',
  ':egg:': '🥚',
  ':cookie:': '🍪',
  ':chocolate_bar:': '🍫',
  ':candy:': '🍬',
  ':lollipop:': '🍭',
  ':cake:': '🍰',
  ':birthday:': '🎂',
  ':custard:': '🍮',
  ':honey_pot:': '🍯',
  ':baby_bottle:': '🍼',
  ':coffee:': '☕',
  ':tea:': '🍵',
  ':sake:': '🍶',
  ':beer:': '🍺',
  ':beers:': '🍻',
  ':cocktail:': '🍸',
  ':tropical_drink:': '🍹',
  ':wine_glass:': '🍷',
  ':fork_and_knife:': '🍴',

  // 乗り物系
  ':car:': '🚗',
  ':taxi:': '🚕',
  ':blue_car:': '🚙',
  ':bus:': '🚌',
  ':trolleybus:': '🚎',
  ':train:': '🚆',
  ':metro:': '🚇',
  ':light_rail:': '🚈',
  ':station:': '🚉',
  ':tram:': '🚊',
  ':minibus:': '🚐',
  ':ambulance:': '🚑',
  ':fire_engine:': '🚒',
  ':police_car:': '🚓',
  ':oncoming_police_car:': '🚔',
  ':truck:': '🚚',
  ':articulated_lorry:': '🚛',
  ':tractor:': '🚜',
  ':bike:': '🚲',
  ':motorcycle:': '🏍️',
  ':airplane:': '✈️',
  ':rocket:': '🚀',
  ':helicopter:': '🚁',
  ':ship:': '🚢',
  ':boat:': '⛵',
  ':anchor:': '⚓',

  // スポーツ系
  ':soccer:': '⚽',
  ':basketball:': '🏀',
  ':football:': '🏈',
  ':baseball:': '⚾',
  ':tennis:': '🎾',
  ':volleyball:': '🏐',
  ':rugby_football:': '🏉',
  ':golf:': '⛳',
  ':ski:': '🎿',
  ':snowboarder:': '🏂',
  ':swimmer:': '🏊',
  ':surfer:': '🏄',
  ':fishing_pole_and_fish:': '🎣',
  ':bicyclist:': '🚴',
  ':mountain_bicyclist:': '🚵',
  ':horse_racing:': '🏇',
  ':trophy:': '🏆',
  ':medal:': '🏅',

  // 建物・場所系
  ':house:': '🏠',
  ':house_with_garden:': '🏡',
  ':school:': '🏫',
  ':office:': '🏢',
  ':post_office:': '🏣',
  ':hospital:': '🏥',
  ':bank:': '🏦',
  ':convenience_store:': '🏪',
  ':love_hotel:': '🏩',
  ':hotel:': '🏨',
  ':wedding:': '💒',
  ':church:': '⛪',
  ':department_store:': '🏬',
  ':european_post_office:': '🏤',
  ':city_sunrise:': '🌇',
  ':city_sunset:': '🌆',
  ':japanese_castle:': '🏯',
  ':european_castle:': '🏰',
  ':tent:': '⛺',
  ':factory:': '🏭',
  ':tokyo_tower:': '🗼',
  ':japan:': '🗾',
  ':mount_fuji:': '🗻',
  ':sunrise_over_mountains:': '🌄',
  ':sunrise:': '🌅',
  ':night_with_stars:': '🌃',
  ':bridge_at_night:': '🌉',
  ':milky_way:': '🌌',
  ':carousel_horse:': '🎠',
  ':ferris_wheel:': '🎡',
  ':fountain:': '⛲',
  ':roller_coaster:': '🎢',
  ':ship:': '🚢',

  // 時計系
  ':watch:': '⌚',
  ':clock1:': '🕐',
  ':clock2:': '🕑',
  ':clock3:': '🕒',
  ':clock4:': '🕓',
  ':clock5:': '🕔',
  ':clock6:': '🕕',
  ':clock7:': '🕖',
  ':clock8:': '🕗',
  ':clock9:': '🕘',
  ':clock10:': '🕙',
  ':clock11:': '🕚',
  ':clock12:': '🕛',

  // 数字系
  ':one:': '1️⃣',
  ':two:': '2️⃣',
  ':three:': '3️⃣',
  ':four:': '4️⃣',
  ':five:': '5️⃣',
  ':six:': '6️⃣',
  ':seven:': '7️⃣',
  ':eight:': '8️⃣',
  ':nine:': '9️⃣',
  ':ten:': '🔟',
  ':hash:': '#️⃣',
  ':zero:': '0️⃣',

  // 記号・フラグ系
  ':100:': '💯',
  ':bangbang:': '‼️',
  ':interrobang:': '⁉️',
  ':question:': '❓',
  ':grey_question:': '❔',
  ':grey_exclamation:': '❕',
  ':exclamation:': '❗',
  ':heavy_plus_sign:': '➕',
  ':heavy_minus_sign:': '➖',
  ':heavy_division_sign:': '➗',
  ':heavy_multiplication_x:': '✖️',
  ':heavy_dollar_sign:': '💲',
  ':currency_exchange:': '💱',
  ':copyright:': '©️',
  ':registered:': '®️',
  ':tm:': '™️',
  ':x:': '❌',
  ':heavy_check_mark:': '✅',
  ':ballot_box_with_check:': '☑️',
  ':radio_button:': '🔘',
  ':white_circle:': '⚪',
  ':black_circle:': '⚫',
  ':red_circle:': '🔴',
  ':blue_circle:': '🔵',
  ':small_red_triangle:': '🔺',
  ':small_red_triangle_down:': '🔻',
  ':small_orange_diamond:': '🔸',
  ':small_blue_diamond:': '🔹',
  ':large_orange_diamond:': '🔶',
  ':large_blue_diamond:': '🔷',
  ':white_square:': '⬜',
  ':black_square:': '⬛',
  ':white_square_button:': '🔳',
  ':black_square_button:': '🔲'
};

/**
 * テキスト内の絵文字コード（:smile:など）を絵文字に変換
 * 
 * @param text 変換対象のテキスト
 * @returns 絵文字に変換されたテキスト
 */
export function convertEmoji(text: string): string {
  if (!text) return text;
  
  // :emoji_name: パターンを絵文字に変換
  return text.replace(/:([a-zA-Z0-9_+-]+):/g, (match, emojiName) => {
    return emojiMap[`:${emojiName}:`] || match;
  });
}

/**
 * テキストに絵文字コードが含まれているかチェック
 * 
 * @param text チェック対象のテキスト
 * @returns 絵文字コードが含まれている場合true
 */
export function hasEmojiCode(text: string): boolean {
  if (!text) return false;
  return /:([a-zA-Z0-9_+-]+):/.test(text);
}

/**
 * 利用可能な絵文字コードの一覧を取得
 * 
 * @returns 絵文字コードの配列
 */
export function getAvailableEmojiCodes(): string[] {
  return Object.keys(emojiMap);
}

/**
 * 絵文字コードから絵文字を取得
 * 
 * @param code 絵文字コード（:smile:など）
 * @returns 対応する絵文字、または元のコード
 */
export function getEmoji(code: string): string {
  return emojiMap[code] || code;
}