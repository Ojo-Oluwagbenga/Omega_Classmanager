import React, {Component} from "react";
import CommentReplies from "./CommentReplies";
import Helper from "../../generals/requesthelper";

class Comment extends Component {
    constructor(props) {
        super(props);

        this.props.comment.open = false
        this.props.comment.address = this.props.comment.parent_address +"|"+this.props.comment.comment_code;        
        
        let h = new Helper();
        h.registerListener(this.props.comment.address, this);
    }  

    listener = (parcel)=>{
        if (parcel.action == 'addchild'){
            this.props.comment.replies[parcel.comment_code] = parcel;
            this.forceUpdate();
        }
    }

    toggle_open_replies(current){
        this.props.comment.open = (current == false);
        this.forceUpdate();
    }

    sendreply(){
        
        let body = this.props.comment.text;
        let c_code = this.props.comment.address;
        
        let parcel = {
            isreply:true,
            address:c_code,
            body:body,
            parent_owner:{
                user_code:this.props.comment.parent_owner.user_code //The parent comment owner
            },
            owner:{
                user_code:this.props.comment.owner.user_code,//The person thats sending this
                name:this.props.comment.owner.name,
            }
        }

        let h = new Helper();
        this.toggle_open_replies(false)
        h.sendParcel("comments", parcel);

    }

    componentDidMount(){
        // console.log("Mounting");
    }


    render() {
        return (
            <div className="commentPack" code={this.props.comment.address}>
                <div className="senderPicsLine">
                    <div className="line"></div>
                    <div className="profilePic"></div>
                </div>
                <div className="commentSuperBox">
                    <div className="commentBox" style={{"boxShadow": "rgba(0, 0, 0, 0.2) 0px 0px 5px"}}>
                            <div className="reverinfo">
                                <div className="c-vert"><div className="reverimg c-vert">A</div></div>
                                <div className="rev-name-date">
                                    <div className="name" style={{"fontWeight": "bold"}}>Ojo John</div>
                                    <div className="role">22/05/2022</div>
                                </div>
                            </div>
                        <div className="cbBody ql-editor">
                            {this.props.comment.text}
                        </div>
                        <div className="cbIcons">
                            <div className="reply entries nocolor-click" onClick={() => this.sendreply()}>
                                <span className="c-vert">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M209.4 39.5c-9.1-9.6-24.3-10-33.9-.9L33.8 173.2c-19.9 18.9-19.9 50.7 0 69.6L175.5 377.4c9.6 9.1 24.8 8.7 33.9-.9s8.7-24.8-.9-33.9L66.8 208 208.5 73.4c9.6-9.1 10-24.3 .9-33.9zM352 64c0-12.6-7.4-24.1-19-29.2s-25-3-34.4 5.4l-160 144c-6.7 6.1-10.6 14.7-10.6 23.8s3.9 17.7 10.6 23.8l160 144c9.4 8.5 22.9 10.6 34.4 5.4s19-16.6 19-29.2V288h32c53 0 96 43 96 96c0 30.4-12.8 47.9-22.2 56.7c-5.5 5.1-9.8 12-9.8 19.5c0 10.9 8.8 19.7 19.7 19.7c2.8 0 5.6-.6 8.1-1.9C494.5 467.9 576 417.3 576 304c0-97.2-78.8-176-176-176H352V64z"/></svg>
                                </span>
                                {/* <span className="c-vert">Reply</span>  */}
                            </div>
                            <div className="reply entries nocolor-click" onClick={() => this.toggle_open_replies(this.props.comment.open)}>
                                <span className="c-vert" style={{transform: this.props.comment.open? "rotate(180deg)": "rotate(0deg)"}}>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M201.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 338.7 54.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z"/></svg>
                                </span>
                                {/* <span className="c-vert">Expand</span>  */}
                            </div>
                        </div>
                    </div>

                    {
                        Object.keys(this.props.comment.replies).length > 0 ?
                            <div className={this.props.comment.open ? "otherReplies open" : "otherReplies"}  openstate="1">

                                <CommentReplies parent_address={this.props.comment.address} replies={this.props.comment.replies}/>
                            </div>
                        : ""
                    }
                    
                </div>
            </div>     
        );
    }
}

export default Comment;
