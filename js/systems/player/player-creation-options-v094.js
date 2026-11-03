/* LEGEND traveler-creation choices.
 * Data-only descriptions and personality bonuses for the existing creation flow.
 * Class, origin and keepsake choices still come from LEGEND_DATA.
 */
(() => {
  const genderOptions = Object.freeze([
    Object.freeze({ id:'woman', label:'Woman', pronouns:'she/her', text:'The face that feels like yours returns through the mist.', glyph:'♀', artSource:'assets/generated/ui/icons/traveler-gender-woman.webp', effect:'Identity and pronouns only; no combat penalty or bonus.' }),
    Object.freeze({ id:'man', label:'Man', pronouns:'he/him', text:'A familiar silhouette settles into focus beneath a road-worn cloak.', glyph:'♂', artSource:'assets/generated/ui/icons/traveler-gender-man.webp', effect:'Identity and pronouns only; no combat penalty or bonus.' }),
    Object.freeze({ id:'nonbinary', label:'Nonbinary', pronouns:'they/them', text:'Your shape returns on your own terms, beyond the labels others expect.', glyph:'⚧', artSource:'assets/generated/ui/icons/traveler-gender-nonbinary.webp', effect:'Identity and pronouns only; no combat penalty or bonus.' }),
    Object.freeze({ id:'unspoken', label:'Keep It Unspoken', pronouns:'they/them', text:'A face stays veiled. The world may learn your name before anything else.', glyph:'◌', artSource:'assets/generated/ui/icons/traveler-gender-unspoken.webp', effect:'Keep your identity private; no combat penalty or bonus.' })
  ]);

  const personalityOptions = Object.freeze([
    Object.freeze({ id:'kind', label:'Kind-Hearted', tag:'+1 Fortune', bonus:Object.freeze({ luck:1 }), artCell:[0,1], effect:'+1 Fortune on road checks; helps favorable outcomes.', text:'You notice fear before weakness.' }),
    Object.freeze({ id:'grim', label:'Grim Survivor', tag:'+1 Roadsense', bonus:Object.freeze({ survival:1 }), artCell:[1,1], effect:'+1 Roadsense on survival, scouting, and preparation checks.', text:'You expect the worst and prepare for it.' }),
    Object.freeze({ id:'bold', label:'Bold Wanderer', tag:'+1 Force', bonus:Object.freeze({ strength:1 }), artCell:[2,1], effect:'+1 Force on strength and physical challenge checks.', text:'You step forward before doubt gets a vote.' }),
    Object.freeze({ id:'clever', label:'Clever Talker', tag:'+1 Lore', bonus:Object.freeze({ lore:1 }), artCell:[3,1], effect:'+1 Lore on strange-event, clue, and knowledge checks.', text:'You listen for what people almost say.' }),
    Object.freeze({ id:'quiet', label:'Quiet Watcher', tag:'+1 Guile', bonus:Object.freeze({ thieving:1 }), artCell:[4,1], effect:'+1 Guile on stealth, locks, and risky reward checks.', text:'You survive by noticing what others miss.' })
  ]);

  function gender(id) {
    return genderOptions.find(option => option.id === id) || genderOptions[3];
  }

  function personality(id) {
    return personalityOptions.find(option => option.id === id) || personalityOptions[0];
  }

  window.LegendPlayerCreationOptionsV094 = Object.freeze({
    genderOptions,
    personalityOptions,
    gender,
    personality
  });
})();
