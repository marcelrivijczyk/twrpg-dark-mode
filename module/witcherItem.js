import { witcher } from "./config.js";
import { extendedRoll } from "../module/chat.js";
import { RollConfig } from "./rollConfig.js";

export default class WitcherItem extends Item {
  chatTemplate = {
    "weapon": "systems/TheWitcherTRPG/templates/partials/chat/weapon-chat.html"
  }

  async roll() {
  }

  async createSpellVisualEffectIfApplicable(token) {
    if (this.type == "spell" && token &&
        this.system.createTemplate &&
        this.system.templateType &&
        this.system.templateSize) {

      token = token.document ? token : token._object
      // todo need to  create some property indicating the initial rotation of the token
      // token can be classic south oriented or user avatar which may look to the different direction
      let tokenRotation = 0

      // Prepare template data
      const templateData = {
            t: this.system.templateType,
            user: game.user.id,
            distance: this.system.templateSize,
            direction: token.document.rotation - tokenRotation,
            x: token.center.x,
            y: token.center.y,
            fillColor: game.user.color,
            flags: this.getSpellFlags()
      };

      switch (this.system.templateType) {
        case "rect":
          templateData.distance = Math.hypot(this.system.templateSize, this.system.templateSize);
          templateData.width = this.system.templateSize;
          templateData.direction = 45;
          //distance = Math.hypot(Number(this.system.templateSize))
          //width = token?.target?.value ?? width
          break;
        case "cone":
          templateData.angle = 45;
          break;
        case "ray":
          templateData.width = 1;
          break;
      }

      let effect = await canvas.scene.createEmbeddedDocuments("MeasuredTemplate", [templateData], { keepId: true });

      this.visualEffectId = effect[0]._id;
    }
  }

  async deleteSpellVisualEffect() {
    if (this.visualEffectId && this.system.visualEffectDuration > 0) {
      setTimeout(() => {
        canvas.scene.deleteEmbeddedDocuments("MeasuredTemplate", [this.visualEffectId])
      }, this.system.visualEffectDuration * 1000);
    }
  }

  getItemAttackSkill() {
    let alias = "";
    switch (this.system.attackSkill) {
      case "Brawling":
        alias = game.i18n.localize("WITCHER.SkRefBrawling")
        break;
      case "Melee":
        alias = game.i18n.localize("WITCHER.SkRefMelee");
        break;
      case "Small Blades":
        alias = game.i18n.localize("WITCHER.SkRefSmall");
        break;
      case "Staff/Spear":
        alias = game.i18n.localize("WITCHER.SkRefStaff");
        break;
      case "Swordsmanship":
        alias = game.i18n.localize("WITCHER.SkRefSwordsmanship");
        break;
      case "Archery":
        alias = game.i18n.localize("WITCHER.SkDexArchery");
        break;
      case "Athletics":
        alias = game.i18n.localize("WITCHER.SkDexAthletics");
        break;
      case "Crossbow":
        alias = game.i18n.localize("WITCHER.SkDexCrossbow");
        break;
      default:
        break;
    }

    return {
      "name": this.system.attackSkill,
      "alias": alias
    };
  }

  getAttackSkillFlags() {
    return {
      "witcher": { "origin": { "name": this.name } },
      "attackSkill": this.system.attackSkill,
      "item": this,
    }
  }

  getSpellFlags() {
    return {
      "witcher": { "origin": { "name": this.name } },
      "spell": this,
      "item": this,
    }
  }

  doesWeaponNeedMeleeSkillToAttack() {
    if (this.system.attackSkill) {
      //Check whether item attack skill is melee
      //Since actor can throw bombs relying on Athletic which is also a melee attack skill
      //We need specific logic for bomb throws
      let meleeSkill = witcher.meleeSkills.includes(this.system.attackSkill)
      let rangedSkill = witcher.rangedSkills.includes(this.system.attackSkill)

      if (meleeSkill && rangedSkill) {
        return meleeSkill && !this.system.usingAmmo && !this.system.isThrowable;
      } else {
        return meleeSkill;
      }
    }
  }

  isAlchemicalCraft() {
    return this.system.alchemyDC && this.system.alchemyDC > 0;
  }

  isWeaponThrowable() {
    return this.system.isThrowable;
  }

  populateAlchemyCraftComponentsList() {
    class alchemyComponent {
      name = "";
      alias = "";
      content = "";
      quantity = 0;

      constructor(name, alias, content, quantity) {
        this.name = name;
        this.alias = alias;
        this.content = content;
        this.quantity = quantity;
      }
    }

    let alchemyCraftComponents = [];
    alchemyCraftComponents.push(
      new alchemyComponent(
        "vitriol",
        game.i18n.localize("WITCHER.Inventory.Vitriol"),
        `<img src="systems/TheWitcherTRPG/assets/images/vitriol.png" class="substance-img" /> <b>${this.system.alchemyComponents.vitriol}</b>`,
        this.system.alchemyComponents.vitriol > 0 ? this.system.alchemyComponents.vitriol : 0
      )
    );
    alchemyCraftComponents.push(
      new alchemyComponent(
        "rebis",
        game.i18n.localize("WITCHER.Inventory.Rebis"),
        `<img src="systems/TheWitcherTRPG/assets/images/rebis.png" class="substance-img" /> <b>${this.system.alchemyComponents.rebis}</b>`,
        this.system.alchemyComponents.rebis > 0 ? this.system.alchemyComponents.rebis : 0
      )
    );
    alchemyCraftComponents.push(
      new alchemyComponent(
        "aether",
        game.i18n.localize("WITCHER.Inventory.Aether"),
        `<img src="systems/TheWitcherTRPG/assets/images/aether.png" class="substance-img" /> <b>${this.system.alchemyComponents.aether}</b>`,
        this.system.alchemyComponents.aether > 0 ? this.system.alchemyComponents.aether : 0
      )
    );
    alchemyCraftComponents.push(
      new alchemyComponent(
        "quebrith",
        game.i18n.localize("WITCHER.Inventory.Quebrith"),
        `<img src="systems/TheWitcherTRPG/assets/images/quebrith.png" class="substance-img" /> <b>${this.system.alchemyComponents.quebrith}</b>`,
        this.system.alchemyComponents.quebrith > 0 ? this.system.alchemyComponents.quebrith : 0
      )
    );
    alchemyCraftComponents.push(
      new alchemyComponent(
        "hydragenum",
        game.i18n.localize("WITCHER.Inventory.Hydragenum"),
        `<img src="systems/TheWitcherTRPG/assets/images/hydragenum.png" class="substance-img" /> <b>${this.system.alchemyComponents.hydragenum}</b>`,
        this.system.alchemyComponents.hydragenum > 0 ? this.system.alchemyComponents.hydragenum : 0
      )
    );
    alchemyCraftComponents.push(
      new alchemyComponent(
        "vermilion",
        game.i18n.localize("WITCHER.Inventory.Vermilion"),
        `<img src="systems/TheWitcherTRPG/assets/images/vermilion.png" class="substance-img" /> <b>${this.system.alchemyComponents.vermilion}</b>`,
        this.system.alchemyComponents.vermilion > 0 ? this.system.alchemyComponents.vermilion : 0
      )
    );
    alchemyCraftComponents.push(
      new alchemyComponent(
        "sol",
        game.i18n.localize("WITCHER.Inventory.Sol"),
        `<img src="systems/TheWitcherTRPG/assets/images/sol.png" class="substance-img" /> <b>${this.system.alchemyComponents.sol}</b>`,
        this.system.alchemyComponents.sol > 0 ? this.system.alchemyComponents.sol : 0
      )
    );
    alchemyCraftComponents.push(
      new alchemyComponent(
        "caelum",
        game.i18n.localize("WITCHER.Inventory.Caelum"),
        `<img src="systems/TheWitcherTRPG/assets/images/caelum.png" class="substance-img" /> <b>${this.system.alchemyComponents.caelum}</b>`,
        this.system.alchemyComponents.caelum > 0 ? this.system.alchemyComponents.caelum : 0
      )
    );
    alchemyCraftComponents.push(
      new alchemyComponent(
        "fulgur",
        game.i18n.localize("WITCHER.Inventory.Fulgur"),
        `<img src="systems/TheWitcherTRPG/assets/images/fulgur.png" class="substance-img" /> <b>${this.system.alchemyComponents.fulgur}</b>`,
        this.system.alchemyComponents.fulgur > 0 ? this.system.alchemyComponents.fulgur : 0
      )
    );

    this.system.alchemyCraftComponents = alchemyCraftComponents;
    return alchemyCraftComponents;
  }

  /**
   * @param {string} rollFormula
   * @param {*} messageData 
   * @param {RollConfig} config 
   */
  async realCraft(rollFormula, messageData, config) {
    //we want to show message to the chat only after removal of items from inventory
    config.showResult = false

    //added crit rolls for craft & alchemy
    let roll = await extendedRoll(rollFormula, messageData, config)

    messageData.flavor += `<label><b> ${this.actor.name}</b></label><br/>`;

    let result = roll.total > config.threshold;
    let craftedItemName;
    if (this.system.associatedItem && this.system.associatedItem.name) {
      let craftingComponents = this.isAlchemicalCraft()
        ? this.system.alchemyCraftComponents.filter(c => Number(c.quantity) > 0)
        : this.system.craftingComponents.filter(c => Number(c.quantity) > 0);

      craftingComponents.forEach(c => {
        let componentsToDelete = this.isAlchemicalCraft()
          ? this.actor.getSubstance(c.name)
          : this.actor.findNeededComponent(c.name);

        let componentsCountToDelete = Number(c.quantity);
        let componentsLeftToDelete = componentsCountToDelete;
        let componentsCountDeleted = 0;

        componentsToDelete.forEach(toDelete => {
          let toDeleteCount = Math.min(Number(toDelete.system.quantity), componentsCountToDelete, componentsLeftToDelete);
          if (toDeleteCount <= 0) {
            return ui.notifications.info(`${game.i18n.localize("WITCHER.craft.SkipRemovalOfComponent")}: ${toDelete.name}`);
          }

          if (componentsCountDeleted < componentsCountToDelete) {
            this.actor.removeItem(toDelete._id, toDeleteCount)
            componentsCountDeleted += toDeleteCount;
            componentsLeftToDelete -= toDeleteCount;
            return ui.notifications.info(`${toDeleteCount} ${toDelete.name} ${game.i18n.localize("WITCHER.craft.ItemsSuccessfullyDeleted")} ${this.actor.name}`);
          }
        });

        if (componentsCountDeleted != componentsCountToDelete || componentsLeftToDelete != 0) {
          result = false;
          return ui.notifications.error(game.i18n.localize("WITCHER.err.CraftItemDeletion"));
        }
      });

      if (result) {
        let craftedItem = { ...this.system.associatedItem };
        Item.create(craftedItem, { parent: this.actor });
        craftedItemName = craftedItem.name;
      }
    } else {
      craftedItemName = game.i18n.localize("WITCHER.craft.SuccessfulCraftForNothing");
    }

    messageData.flavor += `<b>${craftedItemName}</b>`;
    roll.toMessage(messageData);
  }

  async getGameEffects() {
    // search for the compendium pack in the world roll tables by name of the generator
    const effectPacks = game.packs
      .filter(p => p.metadata.type === "Item")
      // Haven't found and easy and proper way of filtering compendiums by different fields
      // than _id, img, folder, name, sort, type
      // So now I see 2 ways of filtering effects with eligible HUD candidates:
      // 1 - Implement new type for the effects rather than keep them in WitcherItem - this will cause massive code rewriting
      // 2 - Open compendiums with effects, load data from them and filter collections one by one. - this is the easiest ways
      // If you know other simpler approach - feel free to modify
      .filter(c => c.index.find(r => r.type === "effect"))

    if (!effectPacks || effectPacks.length == 0) {
      // Provided world does not have associated active HUD effects
      // We should use embedded HUD statuses
      return false
    } else {
        let effectsWithHUDEnabled = []

        for (const ep of effectPacks) {
            let effects = await ep.getDocuments({type:"effect"});
            let r = effects.filter(e => e.system.isActive && e.system.isHUD).
                            flatMap(e => ({
                                id: "@Compendium[" + e.pack + "." + e._id + "]",
                                name: e.name,
                                description: "@Compendium[" + e.pack + "." + e._id + "] - " + e.system.description,
                                label: e.name,
                                icon: e.img
                             }));
            if (r && r.length > 0) {
                effectsWithHUDEnabled = effectsWithHUDEnabled.concat(r);
            }
        }

      return effectsWithHUDEnabled
    }
  }

  /**
   * 
   * @param Number newQuantity 
   * @returns info whether we generated item with the help of the roll table
   */
  async checkIfItemHasRollTable(newQuantity) {
    // search for the compendium pack in the world roll tables by name of the generator
    const compendiumPack = game.packs
      .filter(p => p.metadata.type === "RollTable")
      .filter(c => c.index.find(r => r.name === this.name))

    if (!compendiumPack || compendiumPack.length == 0) {
      // Provided item does not have associated roll table
      // this item should appear in loot sheet as is
      return false
    } else if (compendiumPack.length == 1) {
      // get id of the needed table generator in the compendium pack
      const tableId = compendiumPack[0].index.getName(this.name)._id

      for (let i = 0; i < newQuantity; i++) {
        let roll = await compendiumPack[0].getDocument(tableId).then(el => el.roll())
        let res = roll.results[0]
        let pack = game.packs.get(res.documentCollection)
        await pack.getIndex();
        let genItem = await pack.getDocument(res.documentId)

        if (!genItem) {
          return ui.notifications.error(`${game.i18n.localize("WITCHER.Monster.exportLootExtInvalidItemError")}`)
        }

        // add generated item to the loot sheet
        let itemInLoot = this.actor.items.find(i=> i.name === genItem.name && i.type === genItem.type)
        if (!itemInLoot) {
          await Item.create(genItem, { parent: this.actor })
        } else {
          // if we have already generated item in the loot sheet - increase it's count instead of creation
          let itemToUpdate = itemInLoot[0] ? itemInLoot[0] : itemInLoot
          let itemToUpdateCount = itemToUpdate.system.quantity
          itemToUpdate.update({ 'system.quantity': ++itemToUpdateCount })
        }

        let successMessage = `${game.i18n.localize("WITCHER.Monster.exportLootExtGenerated")}: ${genItem.name}`
        ui.notifications.info(`${successMessage}`)

        //whisper info about generated items from the roll table
        let chatData = {
          user: game.user._id,
          content: `${successMessage} ${res.getChatText()}`,
          whisper: game.users.filter(u => u.isGM).map(u => u._id)
        };
        ChatMessage.create(chatData, {});
      }

      // remove basic item from the loot sheet
      // this item used for generation the actual item from the roll table
      await this.actor.items.get(this.id).delete()

      return true
    } else {
      return ui.notifications.error(`${game.i18n.localize("WITCHER.Monster.exportLootExtToManyRollTablesError")}`)
    }
  }
}