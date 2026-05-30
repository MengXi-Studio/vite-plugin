<script>
export default {
	onLaunch: function () {
		console.log('App Launch')
		// #ifdef H5
		this.hideInitialLoading()
		// #endif
	},
	onShow: function () {
		console.log('App Show')
	},
	onHide: function () {
		console.log('App Hide')
	},
	methods: {
		hideInitialLoading() {
			const manager = window.__LOADING_MANAGER__
			if (manager && manager.isVisible()) {
				manager.hide()
			}
		}
	}
}
</script>

<style>
/*每个页面公共css */
</style>
