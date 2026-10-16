/* LEGEND traveler-creation choices.
 * Data-only descriptions and personality bonuses for the existing creation flow.
 * Class, origin and keepsake choices still come from LEGEND_DATA.
 */
(() => {
  const genderOptions = Object.freeze([
    Object.freeze({ id:'woman', label:'Woman', pronouns:'she/her', text:'Ashmere reads you as a woman of the road. Flavor only.' }),
    Object.freeze({ id:'man', label:'Man', pronouns:'he/him', text:'Ashmere reads you as a man of the road. Flavor only.' }),
    Object.freeze({ id:'nonbinary', label:'Nonbinary', pronouns:'they/them', text:'Ashmere reads you as neither one thing nor another. Flavor only.' }),
    Object.freeze({ id:'unspoken', label:'Keep It Unspoken', pronouns:'they/them', text:'Ashmere learns your name first. The rest can stay yours.' })
  ]);

  const personalityOptions = Object.freeze([
    Object.freeze({ id:'kind', label:'Kind-Hearted', tag:'+1 luck', bonus:Object.freeze({ luck:1 }), text:'You notice fear before weakness.' }),
    Object.freeze({ id:'grim', label:'Grim Survivor', tag:'+1 survival', bonus:Object.freeze({ survival:1 }), text:'You expect the worst and prepare for it.' }),
    Object.freeze({ id:'bold', label:'Bold Wanderer', tag:'+1 strength', bonus:Object.freeze({ strength:1 }), text:'You step forward before doubt gets a vote.' }),
    Object.freeze({ id:'clever', label:'Clever Talker', tag:'+1 lore', bonus:Object.freeze({ lore:1 }), text:'You listen for what people almost say.' }),
    Object.freeze({ id:'quiet', label:'Quiet Watcher', tag:'+1 thieving', bonus:Object.freeze({ thieving:1 }), text:'You survive by noticing what others miss.' })
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
