<script>
export default {
  props: {
    size: {
      type:    String,
      default: '' // possible values are xs, sm, lg. empty is default .btn
    },
    // whether this is a button and dropdown (default) or dropdown that looks like a button/dropdown
    dualAction: {
      type:    Boolean,
      default: true
    },

    disableButton: {
      type:    Boolean,
      default: false
    }
  },

  computed: {
    buttonSize() {
      const { size } = this;
      let out;

      switch (size) {
      case '':
      default:
        out = 'btn';
        break;
      case 'xs':
        out = 'btn btn-xs';
        break;
      case 'sm':
        out = 'btn btn-sm';
        break;
      case 'lg':
        out = 'btn btn-lg';
        break;
      }

      return out;
    }
  },

  methods: {
    hasSlot(name = 'default') {
      return !!this.$slots[name] || !!this.$scopedSlots[name];
    },

    // allows parent components to programmatically open the dropdown
    togglePopover() {
      // this.$refs.popoverButton.click();
    },
  }
};
</script>
<template>
  <div class="dropdown-button-group">
    <div
      class="dropdown-button bg-primary"
      :class="{'one-action':!dualAction, [buttonSize]:true, 'disabled': disableButton}"
    >
      <slot v-if="dualAction" name="button-content" :buttonSize="buttonSize">
        <button
          class="bg-transparent"
          :class="buttonSize"
          disabled="true"
          type="button"
        >
          Button
        </button>
      </slot>
      <div
        v-else
        :class="buttonSize"
        type="button"
      >
        <slot name="button-content" />
      </div>
      <div v-if="hasSlot('popover-content') && dualAction" class="button-divider"></div>

      <v-popover
        v-if="hasSlot('popover-content')"
        placement="bottom"
        :container="false"
        offset="10"
        :disabled="disableButton"
        :popper-options="{modifiers: { flip: { enabled: false } } }"
      >
        <slot name="button-toggle-content" :buttonSize="buttonSize">
          <button
            ref="popoverButton"
            class="icon-container bg-transparent no-left-border-radius"
            :class="buttonSize"
            :disabled="disableButton"
            type="button"
          >
            <i class="icon icon-chevron-down" />
          </button>
        </slot>

        <template v-if="!disableButton" slot="popover">
          <slot name="popover-content" />
        </template>
      </v-popover>
    </div>
  </div>
</template>

<style lang="scss">
// load here instead of component so SSR render isn't all wonky
.dropdown-button-group {
  $xs-padding: 2px 3px;

  .no-left-border-radius {
    border-top-left-radius: 0px;
    border-bottom-left-radius: 0px;
  }

  .no-right-border-radius {
    border-top-right-radius: 0px;
    border-bottom-right-radius: 0px;
  }

  .btn {
    line-height: normal !important;
    border: 0px;
    min-height: 22px !important;
  }

  .btn-xs,
  .btn-group-xs > .btn,
  .btn-xs .btn-label {
      padding: $xs-padding;
      font-size: 13px;
  }

  // this matches the top/bottom padding of the default button
  $trigger-padding: 15px 10px 15px 10px;
  $xs-trigger-padding: 2px 4px 4px 4px;
  $sm-trigger-padding: 8px 10px 10px 10px;
  $lg-trigger-padding: 18px 10px 10px 10px;

  .v-popover {
    .text-right {
      margin-top: 5px;
    }
    .trigger {
      height: 100%;
      .icon-container {
        height: 100%;
        padding: 10px 10px 10px 10px;
        i {
          transform: scale(1);
        }
        &.btn-xs {
          padding: $xs-trigger-padding;
        }
        &.btn-sm {
          padding: $sm-trigger-padding;
        }
        &.btn-lg {
          padding: $lg-trigger-padding;
        }
        &:focus {
          outline-style: none;
          box-shadow: none;
          border-color: transparent;
        }
      }
    }
  }

  .dropdown-button {
    background: var(--tooltip-bg);
    border: solid thin var(--link-text);
    color: var(--link-text);
    padding: 0;
    display: inline-flex;

    .wrapper-content {
      button {
        border-right: 0px;
      }
    }

    &>*, .icon-chevron-down {
      color: var(--primary);
      background-color: rgba(0,0,0,0);
    }

    .button-divider {
      border-right: 1px solid var(--link-text);
    }

    &.bg-primary:hover {
      background: var(--accent-btn-hover);
    }

    &.one-action {
      position: relative;
      &>.btn {
        padding: 15px 35px 15px 15px;
      }
      .v-popover{
        .trigger{
          position: absolute;
          top: 0px;
          right: 0px;
          left: 0px;
          bottom: 0px;
          BUTTON {
            position: absolute;
            right: 0px;
          }
        }
      }
    }
  }
  .popover {
    border: none;
  }
  .tooltip {
    &[x-placement^="bottom"] {
      .tooltip-arrow {
        border-bottom-color: var(--dropdown-border);

        &:after {
          border-bottom-color: var(--dropdown-bg);
        }
      }
    }

    .tooltip-inner {
      color: var(--dropdown-text);
      background-color: var(--dropdown-bg);
      border: 1px solid var(--dropdown-border);
      padding: 0px;
      text-align: left;

      LI {
        padding: 10px 50px 10px 20px;

        &.divider {
          padding-top: 0px;
          padding-bottom: 0px;

          > .divider-inner {
            padding: 0;
            border-bottom: 1px solid var(--dropdown-divider);
            width: 125%;
            margin: 0 auto;
          }
        }

        &:not(.divider):hover {
          background-color: var(--dropdown-hover-bg);
          color: var(--dropdown-hover-text);
          cursor: pointer;
        }
      }

    }
  }

  //header
  .user-info {
    border-bottom: 1px solid var(--border);
    display: block;
  }
}

</style>
