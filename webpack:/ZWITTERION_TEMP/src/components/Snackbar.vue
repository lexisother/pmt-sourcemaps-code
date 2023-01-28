<template>
    <VSnackbar
        v-if="show"
        v-model="show"
        :top="snackbar.top"
        :bottom="snackbar.bottom"
        :right="snackbar.right"
        :left="snackbar.left"
        :color="snackbarColor"
        :multi-line="snackbar.multiLine"
        :timeout="snackbarTimeout"
        :vertical="snackbar.vertical"
        class="d-print-none"
    >
        {{ snackbar.message }}
        <template
            v-if="!snackbar.permanent"
            #action
        >
            <PmtButton
                primary
                inverted
                :class="'close-btn'"
                @click="HIDE_SNACKBAR()"
            >
                {{ $t('components.modal.closeBtn.label') }}
            </PmtButton>
        </template>
    </VSnackbar>
</template>

<script>
import { mapMutations, mapGetters } from 'vuex'
export default {
    name: 'Snackbar',
    computed: {
        ...mapGetters({
            snackbar: 'GET_SNACKBAR',
        }),
        show: {
            get () {
                return this.snackbar.show
            },
            set () {
                this.HIDE_SNACKBAR()
            },
        },
        snackbarColor () {
            if (this.snackbar.color) return this.snackbar.color
            if (this.snackbar.error) {
                return 'red'
            }
            if (this.snackbar.success) {
                return 'success'
            }
            if (this.snackbar.warning) {
                return 'warning'
            }
            return ''
        },
        snackbarTimeout () {
            if (this.snackbar.permanent) return -1
            if (!this.snackbar.autoClose) return 0
            return this.snackbar.timeout
        },
    },
    methods: {
        ...mapMutations(['SET_SNACKBAR', 'HIDE_SNACKBAR']),
    },
}
</script>

<style scoped>
  .close-btn {
      padding: 8px 12px;
      margin: -8px -6px -8px 20px;
      font-family: inherit;
      font-size: inherit;
      text-transform: uppercase;
      border: 0;
      border-radius: 3px;
      background-color: transparent;
      cursor: pointer;
      outline: 0;
      transition: background-color .25s ease;
  }
  .undo {
      color: #fd506e;
  }
  :deep() .warning {
      background-color: var(--orange-60) !important;
      color: var(--grey-140) !important;
  }
      .close-btn:hover {
          background-color: rgba(68, 138, 255, 0.1);
      }
      .close-btn:active {
          background-color: rgba(68, 138, 255, 0.2);
          transition-duration: .35s;
      }
    /*https://www.w3schools.com/howto/howto_js_snackbar.asp*/
    .snackbar {
        visibility: hidden;
        z-index: 10;
        position: fixed;
        display: flex;
        left: 0;
        right: 0;
        bottom: 3%;
    }
    .snackbar.show {
        visibility: visible; /* Show the snackbar */
        -webkit-animation: fadein 0.5s, fadeout 0.5s 5s;
        animation: fadein 0.5s, fadeout 0.5s 5s;
    }

  /* Animations to fade the snackbar in and out */
  @-webkit-keyframes fadein {
    from {
      bottom: 0;
      opacity: 0;
    }
    to {
      bottom: 3%;
      opacity: 1;
    }
  }
  @keyframes fadein {
    from {
      bottom: 0;
      opacity: 0;
    }
    to {
      bottom: 3%;
      opacity: 1;
    }
  }
  @-webkit-keyframes fadeout {
    from {
      bottom: 3%;
      opacity: 1;
    }
    to {
      bottom: 0;
      opacity: 0;
    }
  }
  @keyframes fadeout {
    from {
      bottom: 3%;
      opacity: 1;
    }
    to {
      bottom: 0;
      opacity: 0;
    }
  }
</style>
